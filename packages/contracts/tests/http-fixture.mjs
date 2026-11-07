import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import ts from 'typescript';

const fixture = async (name) => JSON.parse(await readFile(new URL(`../fixtures/${name}.json`, import.meta.url), 'utf8'));
const assignment = await fixture('assignment');
const submission = await fixture('submission');

// Run the real typed web transport through a loopback HTTP server. The server is
// deliberately a fixture: feature modules own business authorization and writes.
const clientSource = await readFile(new URL('../../../apps/web/src/api/generated/client.ts', import.meta.url), 'utf8');
const clientJavaScript = ts.transpileModule(clientSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { ApiError, createAssignment, submit } = await import(`data:text/javascript;base64,${Buffer.from(clientJavaScript).toString('base64')}`);

const seen = [];
const server = createServer(async (request, response) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  seen.push({ path: request.url, method: request.method, headers: request.headers, body });
  let status = 404;
  let payload = { error: { code: 'NOT_FOUND', message: 'Not found', details: {} }, requestId: 'req_404' };
  if (request.method === 'POST' && request.url === '/api/v2/classes/c_1/assignments') {
    status = 200;
    payload = assignment.success;
  } else if (request.method === 'POST' && request.url === '/api/v2/assignment-recipients/r_1/submissions') {
    if (request.headers['if-match'] === '"0"') {
      status = 412;
      payload = submission.stale;
    } else if (body.text !== submission.request.text) {
      status = 409;
      payload = submission.conflict;
    } else {
      status = 200;
      payload = submission.success;
    }
  }
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const address = server.address();
assert.ok(address && typeof address === 'object');
const nativeFetch = globalThis.fetch;
globalThis.fetch = (path, options) => {
  assert.equal(options.credentials, 'include');
  return nativeFetch(`http://127.0.0.1:${address.port}${path}`, options);
};
try {
  assert.deepEqual(await createAssignment('c_1', assignment.request, { csrfToken: 'csrf' }), assignment.success);
  assert.deepEqual(await submit('r_1', submission.request, { csrfToken: 'csrf', etag: '"1"', idempotencyKey: 'key-1' }), submission.success);
  await assert.rejects(
    () => submit('r_1', { text: 'Changed' }, { csrfToken: 'csrf', etag: '"1"', idempotencyKey: 'key-1' }),
    (error) => error instanceof ApiError && error.status === 409 && error.body.error.code === 'IDEMPOTENCY_CONFLICT',
  );
  await assert.rejects(
    () => submit('r_1', submission.request, { csrfToken: 'csrf', etag: '"0"', idempotencyKey: 'key-2' }),
    (error) => error instanceof ApiError && error.status === 412 && error.body.error.code === 'VERSION_CONFLICT',
  );
  assert.deepEqual(seen.map(({ path, method }) => [method, path]), [
    ['POST', '/api/v2/classes/c_1/assignments'],
    ['POST', '/api/v2/assignment-recipients/r_1/submissions'],
    ['POST', '/api/v2/assignment-recipients/r_1/submissions'],
    ['POST', '/api/v2/assignment-recipients/r_1/submissions'],
  ]);
  assert.deepEqual(seen[0].body, assignment.request);
  assert.deepEqual(seen[1].body, submission.request);
  for (const item of seen) assert.equal(item.headers['x-csrf-token'], 'csrf');
  for (const item of seen.slice(1)) assert.ok(item.headers['idempotency-key']);
  assert.equal(seen[1].headers['if-match'], '"1"');
  assert.equal(seen[3].headers['if-match'], '"0"');
  console.log('PASS: typed client crosses HTTP with assignment/submission, 409/412 and required headers');
} finally {
  globalThis.fetch = nativeFetch;
  await new Promise((resolve) => server.close(resolve));
}
