import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';

export class TestDb {
  accounts = new Map<string, any>();
  accountUsages = new Map<string, any>();
  workspaces = new Map<string, any>();
  workspaceMemberships = new Map<string, any>();
  classes = new Map<string, any>();
  classMemberships = new Map<string, any>();
  classJoinCodes = new Map<string, any>();
  classPolicies = new Map<string, any>();
  joinRequests = new Map<string, any>();
  invitations = new Map<string, any>();
  transferRequests = new Map<string, any>();
  grants = new Map<string, any>();
  passwordResetTokens = new Map<string, any>();
  sessions = new Map<string, any>();
  auditEvents = new Map<string, any>();

  client: PrismaClient;

  constructor() {
    const self = this;

    const createDelegate = (map: Map<string, any>, name: string) => ({
      findUnique: async ({ where, include }: any) => {
        let item: any = null;
        if (where.id) item = map.get(where.id) ?? null;
        else if (where.email) {
          for (const it of map.values()) {
            if (it.email?.toLowerCase() === where.email.toLowerCase()) {
              item = it;
              break;
            }
          }
        } else if (where.googleSubject) {
          for (const it of map.values()) {
            if (it.googleSubject === where.googleSubject) { item = it; break; }
          }
        } else if (where.accountId_usage) {
          item = map.get(`${where.accountId_usage.accountId}:${where.accountId_usage.usage}`) ?? null;
        } else if (where.classId) {
          for (const it of map.values()) {
            if (it.classId === where.classId) {
              item = it;
              break;
            }
          }
        }
        if (!item) return null;
        const res = { ...item };
        if (name === 'account' && include?.usages) {
          res.usages = [...self.accountUsages.values()].filter(u => u.accountId === item.id);
        }
        return res;
      },
      findFirst: async ({ where }: any) => {
        for (const item of map.values()) {
          let match = true;
          for (const [k, v] of Object.entries(where)) {
            if (v && typeof v === 'object' && 'not' in v) {
              if (item[k] === (v as any).not) match = false;
            } else if (v && typeof v === 'object' && 'in' in v) {
              if (!(v as any).in.includes(item[k])) match = false;
            } else if (v && typeof v === 'object' && 'gt' in v) {
              if (!(item[k] > (v as any).gt)) match = false;
            } else if (item[k] !== v) {
              match = false;
            }
          }
          if (match) return item;
        }
        return null;
      },
      findMany: async (args?: any) => {
        const where = args?.where ?? {};
        let results: any[] = [];
        for (const item of map.values()) {
          let match = true;
          if (where.OR) {
            match = where.OR.some((sub: any) => {
              for (const [k, v] of Object.entries(sub)) {
                if (v && typeof v === 'object' && 'in' in v) {
                  if (!(v as any).in.includes(item[k])) return false;
                } else if (v && typeof v === 'object' && 'some' in v) {
                  if (k === 'memberships') {
                    const hasSome = [...self.classMemberships.values()].some(m => m.classId === item.id && m.accountId === (v as any).some.accountId && m.status === (v as any).some.status);
                    if (!hasSome) return false;
                  }
                } else if (item[k] !== v) {
                  return false;
                }
              }
              return true;
            });
          } else {
            for (const [k, v] of Object.entries(where)) {
              if (v && typeof v === 'object' && 'in' in v) {
                if (!(v as any).in.includes(item[k])) match = false;
              } else if (v && typeof v === 'object' && 'not' in v) {
                if (item[k] === (v as any).not) match = false;
              } else if (item[k] !== v) {
                match = false;
              }
            }
          }
          if (match) results.push(item);
        }
        return results;
      },
      create: async ({ data }: any) => {
        const id = data.id ?? randomUUID();
        const record = { id, version: 1, createdAt: new Date(), updatedAt: new Date(), ...data };
        if (name === 'accountUsage') {
          map.set(`${record.accountId}:${record.usage}`, record);
        } else if (name === 'account') {
          map.set(id, record);
          if (data.usages?.create) {
            for (const u of data.usages.create) {
              self.accountUsages.set(`${id}:${u.usage}`, { id: randomUUID(), accountId: id, usage: u.usage });
            }
          }
        } else {
          map.set(id, record);
        }
        if (name === 'account' && data.usages?.create) {
          return { ...record, usages: [...self.accountUsages.values()].filter(u => u.accountId === id) };
        }
        return record;
      },
      createMany: async ({ data }: any) => {
        for (const d of data) {
          const id = d.id ?? randomUUID();
          const record = { id, version: 1, createdAt: new Date(), updatedAt: new Date(), ...d };
          if (name === 'accountUsage') {
            map.set(`${record.accountId}:${record.usage}`, record);
          } else {
            map.set(id, record);
          }
        }
        return { count: data.length };
      },
      update: async ({ where, data }: any) => {
        let item = await createDelegate(map, name).findUnique({ where });
        if (!item) throw new Error(`Not found in ${name}`);
        const version = data.version && typeof data.version === 'object' && 'increment' in data.version
          ? item.version + 1
          : (data.version ?? item.version);
        const updated = { ...item, ...data, version, updatedAt: new Date() };
        if (name === 'accountUsage') {
          map.set(`${updated.accountId}:${updated.usage}`, updated);
        } else {
          map.set(item.id, updated);
        }
        return updated;
      },
      updateMany: async ({ where, data }: any) => {
        const items = await createDelegate(map, name).findMany({ where });
        for (const item of items) {
          const version = data.version && typeof data.version === 'object' && 'increment' in data.version
            ? item.version + 1
            : (data.version ?? item.version);
          const updated = { ...item, ...data, version, updatedAt: new Date() };
          if (name === 'accountUsage') {
            map.set(`${updated.accountId}:${updated.usage}`, updated);
          } else {
            map.set(item.id, updated);
          }
        }
        return { count: items.length };
      },
      deleteMany: async ({ where }: any) => {
        const items = await createDelegate(map, name).findMany({ where });
        for (const item of items) {
          if (name === 'accountUsage') {
            map.delete(`${item.accountId}:${item.usage}`);
          } else {
            map.delete(item.id);
          }
        }
        return { count: items.length };
      },
      upsert: async ({ where, create, update }: any) => {
        const item = await createDelegate(map, name).findUnique({ where });
        if (item) {
          return createDelegate(map, name).update({ where, data: update });
        }
        return createDelegate(map, name).create({ data: create });
      },
      count: async ({ where }: any) => {
        const items = await createDelegate(map, name).findMany({ where });
        return items.length;
      },
    });

    const clientObj: any = {
      account: createDelegate(this.accounts, 'account'),
      accountUsage: createDelegate(this.accountUsages, 'accountUsage'),
      workspace: createDelegate(this.workspaces, 'workspace'),
      workspaceMembership: createDelegate(this.workspaceMemberships, 'workspaceMembership'),
      class: createDelegate(this.classes, 'class'),
      classMembership: createDelegate(this.classMemberships, 'classMembership'),
      classJoinCode: createDelegate(this.classJoinCodes, 'classJoinCode'),
      classPolicy: createDelegate(this.classPolicies, 'classPolicy'),
      joinRequest: createDelegate(this.joinRequests, 'joinRequest'),
      invitation: createDelegate(this.invitations, 'invitation'),
      transferRequest: createDelegate(this.transferRequests, 'transferRequest'),
      grant: createDelegate(this.grants, 'grant'),
      passwordResetToken: createDelegate(this.passwordResetTokens, 'passwordResetToken'),
      session: createDelegate(this.sessions, 'session'),
      auditEvent: createDelegate(this.auditEvents, 'auditEvent'),
      $queryRaw: async () => [],
      $executeRaw: async () => 0,
      $transaction: async (fn: any) => fn(clientObj),
    };

    this.client = clientObj as PrismaClient;
  }
}
