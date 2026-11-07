"""Fast offline consistency checks for the SNOTE v2 OpenAPI source."""
from pathlib import Path
import yaml
from jsonschema import Draft202012Validator

root = Path(__file__).resolve().parents[1]
doc = yaml.safe_load((root / "docs/contracts/openapi.yaml").read_text())
assert doc["openapi"].startswith("3.1.")
schemas = doc["components"]["schemas"]
operations, refs = [], []

def walk(value):
    if isinstance(value, dict):
        if "$ref" in value: refs.append(value["$ref"])
        for sub in value.values(): walk(sub)
    elif isinstance(value, list):
        for sub in value: walk(sub)

walk(doc)
for route, methods in doc["paths"].items():
    for method, op in methods.items():
        operations.append(op["operationId"])
        assert "200" in op["responses"], route
        path_names = {p[1:-1] for p in route.split("/") if p.startswith("{")}
        named = {p["name"] for p in op.get("parameters", []) if p["in"] == "path"}
        assert named == path_names, route
        if method in ("post", "patch", "put", "delete") and (not route.startswith("/auth/") or route == "/auth/logout"):
            assert any(p["name"] == "X-CSRF-Token" for p in op.get("parameters", [])), route
assert len(operations) == len(set(operations)), "Duplicate operationId"
assert all(r.startswith("#/components/schemas/") and r.split("/")[-1] in schemas for r in refs)
required = ["/auth/register", "/auth/login", "/classes", "/classes/{classId}/join-requests",
            "/classes/{classId}/groups", "/me/tasks", "/me/events", "/workspaces/{workspaceId}/tasks",
            "/events", "/workspaces/{workspaceId}/library/items", "/uploads",
            "/assignment-recipients/{recipientId}/submissions", "/operations/by-key/{key}"]
assert all(p in doc["paths"] for p in required)
def accepts(schema_name, payload):
    wrapper = {"$ref": f"#/components/schemas/{schema_name}", "components": {"schemas": schemas}}
    return Draft202012Validator(wrapper).is_valid(payload)
assert accepts("SubmissionInput", {"text":"Bản nộp"})
assert not accepts("SubmissionInput", {"text":"", "links":[], "uploadIds":[]})
assert accepts("AssignmentInput", {"title":"Bài giao", "recipientWorkspaceIds":["w1"]})
assert not accepts("AssignmentInput", {"title":"Bài giao", "recipientWorkspaceIds":[]})
assert accepts("FolderInput", {"name":"Nguồn"})
assert not accepts("FolderInput", {"id":"f1"})
assert accepts("EventInput", {"title":"Thi", "scope":{"type":"class","id":"c1"}, "allDay":{"startDate":"2026-11-10","endDateExclusive":"2026-11-11","timeZone":"Asia/Ho_Chi_Minh"}})
assert not accepts("EventInput", {"title":"Thi", "scope":{"type":"class","id":"c1"}, "allDay":{"startDate":"2026-11-10","endDateExclusive":"2026-11-11","timeZone":"Asia/Ho_Chi_Minh"}, "timed":{"startsAt":"2026-11-10T10:00:00Z","endsAt":"2026-11-10T11:00:00Z"}})
print(f"PASS: {len(doc['paths'])} paths, {len(operations)} unique operations, {len(refs)} resolved refs")
