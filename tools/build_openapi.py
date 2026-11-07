"""Build the v2 contract from one checked-in operation registry. No v1 input."""
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/contracts/openapi.yaml"

def obj(properties, required=()):
    return {"type": "object", "additionalProperties": False,
            "properties": properties, "required": list(required)}

def string(**kw): return {"type": "string", **kw}
def ref(name): return {"$ref": f"#/components/schemas/{name}"}
def arr(item): return {"type": "array", "items": item}
ID = string(minLength=1)
DATE = string(format="date")
TIME = string(format="date-time")
STR = string()

S = {
 "Register": obj({"email":string(format="email"),"password":string(minLength=12),"usages":arr(string(enum=["student","teacher","personal"])),"timeZone":ID}, ("email","password","usages","timeZone")),
 "Login": obj({"email":string(format="email"),"password":ID}, ("email","password")),
 "PasswordResetRequest": obj({"email":string(format="email")}, ("email",)),
 "PasswordReset": obj({"token":ID,"newPassword":string(minLength=12)}, ("token","newPassword")),
 "Error": obj({"error": obj({"code": STR, "message": STR, "details": {"type":"object"}}, ("code","message")), "requestId": ID}, ("error","requestId")),
 "UsageUpdate": obj({"usages": arr(string(enum=["student","teacher","personal"]))}, ("usages",)),
 "ClassCreate": obj({"name": string(minLength=1), "timeZone": ID}, ("name","timeZone")),
 "InvitationCreate": obj({"inviteeId": ID}, ("inviteeId",)),
 "JoinClass": obj({"code": ID}, ("code",)),
 "JoinCode": obj({"enabled":{"type":"boolean"}}, ("enabled",)),
 "DueDate": obj({"date":DATE,"timeZone":ID}, ("date","timeZone")),
 "GroupCreate": obj({"name": string(minLength=1), "leaderId": ID}, ("name",)),
 "Transfer": obj({"recipientId": ID}, ("recipientId",)),
 "LeaderChange": obj({"leaderId": ID}, ("leaderId",)),
 "GrantInput": obj({"principalId": ID, "action": ID, "scopeType": string(enum=["class","workspace","assignment"]), "scopeId": ID}, ("principalId","action","scopeType","scopeId")),
 "Policy": obj({"groupLimit": {"type":"integer","minimum":1}, "roleActions": {"type":"object","additionalProperties": arr(ID)}, "lateFirst": string(enum=["allow","lock"]), "lateRevision": string(enum=["allow","lock"])}, ()),
 "Handover": obj({"handoverTo": ID}, ()),
 "RemoveMember": obj({"memberId":ID,"handoverTo":ID}, ("memberId",)),
 "TaskCreate": obj({"title": string(minLength=1), "dueAt": TIME,"dueDate":ref("DueDate"), "importance": string(enum=["high","medium","low"]), "assigneeId": ID}, ("title",)),
 "TaskUpdate": obj({"title": STR, "dueAt": TIME,"dueDate":ref("DueDate"), "importance": string(enum=["high","medium","low"]), "status": string(enum=["todo","doing","done"])}, ()),
 "BulkTasks": obj({"ids":arr(ID),"action":string(enum=["archive","trash"])}, ("ids","action")),
 "Reassign": obj({"assigneeId": ID}, ("assigneeId",)),
 "Checklist": obj({"text": string(minLength=1), "done": {"type":"boolean"}}, ("text",)),
 "WorkSession": obj({"taskId": ID, "startAt": TIME, "endAt": TIME}, ("taskId","startAt","endAt")),
 "AllDay": obj({"startDate": DATE, "endDateExclusive": DATE, "timeZone": ID}, ("startDate","endDateExclusive","timeZone")),
 "Timed": obj({"startsAt": TIME, "endsAt": TIME}, ("startsAt","endsAt")),
 "Scope": obj({"type": string(enum=["private","workspace","class"]), "id": ID}, ("type",)),
 "EventInput": {"oneOf":[obj({"title": string(minLength=1),"scope":ref("Scope"),"allDay":ref("AllDay"),"audience":arr(ID),"content":STR}, ("title","scope","allDay")), obj({"title": string(minLength=1),"scope":ref("Scope"),"timed":ref("Timed"),"audience":arr(ID),"content":STR}, ("title","scope","timed"))]},
 "LibraryItem": obj({"type": string(enum=["text","link","file"]), "title": STR,"content":STR,"url":STR,"folderId":ID,"uploadId":ID}, ("type",)),
 "Copy": obj({"targetWorkspaceId":ID,"sourceRevisionId":ID,"folderId":ID}, ("targetWorkspaceId","sourceRevisionId")),
 "UploadStart": obj({"fileName":ID,"size":{"type":"integer","minimum":1,"maximum":26214400},"declaredType":ID,"scopeType":string(enum=["workspace","class"]),"scopeId":ID}, ("fileName","size","declaredType","scopeType","scopeId")),
 "FolderInput": obj({"name":string(minLength=1),"parentId":ID}, ("name",)),
 "AssignmentInput": obj({"title":string(minLength=1),"recipientWorkspaceIds":arr(ID),"description":STR,"deadline":TIME,"deadlineDate":ref("DueDate"),"attachmentUploadIds":arr(ID),"lateFirst":string(enum=["inherit","allow","lock"]),"lateRevision":string(enum=["inherit","allow","lock"])}, ("title","recipientWorkspaceIds")),
 "SubmissionInput": obj({"text":STR,"links":arr(STR),"uploadIds":arr(ID)}, ()),
 "Feedback": obj({"text":string(minLength=1)}, ("text",)),
 "Update": obj({"text":string(minLength=1)}, ("text",)),
 "Result": obj({"data": {"type":"object","additionalProperties":True}, "requestId":ID}, ("data","requestId")),
 "ListResult": obj({"data":arr({"type":"object","additionalProperties":True}), "nextCursor":STR,"requestId":ID}, ("data","requestId")),
 "Operation": obj({"status":string(enum=["pending","succeeded","failed"]),"receipt": {"type":"object","additionalProperties":True},"requestId":ID}, ("status","requestId")),
}
actions=["class.manage","class.role_change","group.create","group.approve","member.invite","member.remove",
         "workspace.manage","task.create","task.assign","task.edit_common","task.checklist","task.delete",
         "event.create","event.edit","event.cancel","library.create","library.edit_text","library.edit_file",
         "library.delete","folder.manage","assignment.create","assignment.edit","progress.update",
         "submission.send","submission.feedback"]
S["Action"]={"type":"string","enum":actions}
S["GrantInput"]["properties"]["action"]=ref("Action")
S["Policy"]["properties"]["roleActions"]["additionalProperties"] = arr(ref("Action"))

entities={
 "account": obj({"id":ID,"usages":arr(string(enum=["student","teacher","personal"])),"version":{"type":"integer"}}, ("id","usages","version")),
 "class": obj({"id":ID,"name":STR,"ownerId":ID,"timeZone":ID,"status":string(enum=["active","archived"]),"version":{"type":"integer"}}, ("id","name","ownerId","timeZone","status","version")),
 "membership": obj({"id":ID,"classId":ID,"workspaceId":ID,"memberId":ID,"role":string(enum=["member","monitor","leader"]),"status":string(enum=["pending","active","declined","invalidated","ended"]),"version":{"type":"integer"}}, ("id","memberId","status","version")),
 "workspace": obj({"id":ID,"classId":ID,"ownerId":ID,"kind":string(enum=["default","independent","class_group"]),"status":string(enum=["active","archived"]),"timeZone":ID,"version":{"type":"integer"}}, ("id","kind","status","timeZone","version")),
 "grant": obj({"id":ID,"principalId":ID,"action":ID,"scopeType":ID,"scopeId":ID,"version":{"type":"integer"}}, ("id","principalId","action","scopeType","scopeId","version")),
 "task": obj({"id":ID,"workspaceId":ID,"title":STR,"assigneeId":ID,"importance":string(enum=["high","medium","low"]),"status":string(enum=["todo","doing","done"]),"dueAt":TIME,"version":{"type":"integer"}}, ("id","workspaceId","title","importance","status","version")),
 "event": obj({"id":ID,"title":STR,"scope":ref("Scope"),"allDay":ref("AllDay"),"timed":ref("Timed"),"status":string(enum=["active","cancelled"]),"version":{"type":"integer"}}, ("id","title","scope","status","version")),
 "library": obj({"id":ID,"workspaceId":ID,"type":string(enum=["text","link","file"]),"title":STR,"currentRevisionId":ID,"status":string(enum=["active","trash"]),"version":{"type":"integer"}}, ("id","workspaceId","type","status","version")),
 "upload": obj({"id":ID,"scopeId":ID,"status":string(enum=["staged","verified","committed","aborted"]),"size":{"type":"integer"}}, ("id","status","size")),
 "assignment": obj({"id":ID,"classId":ID,"title":STR,"recipientWorkspaceIds":arr(ID),"deadline":TIME,"version":{"type":"integer"}}, ("id","classId","title","recipientWorkspaceIds","version")),
 "submission": obj({"id":ID,"recipientId":ID,"version":{"type":"integer"},"acceptedAt":TIME,"timeliness":string(enum=["on_time","late"]),"submittedBy":ID}, ("id","recipientId","version","acceptedAt","timeliness","submittedBy")),
 "recipient": obj({"id":ID,"assignmentId":ID,"workspaceId":ID,"submissionVersion":{"type":"integer"},"progressText":STR}, ("id","assignmentId","workspaceId")),
 "worksession": obj({"id":ID,"taskId":ID,"ownerId":ID,"startAt":TIME,"endAt":TIME}, ("id","taskId","ownerId","startAt","endAt")),
 "folder": obj({"id":ID,"workspaceId":ID,"name":STR,"parentId":ID}, ("id","workspaceId","name")),
 "download": obj({"url":ID,"expiresAt":TIME}, ("url","expiresAt")),
}
for family,entity in entities.items():
    label=family.title()
    S[label]=entity
    S[label+"Result"]=obj({"data":ref(label),"requestId":ID}, ("data","requestId"))
    S[label+"ListResult"]=obj({"data":arr(ref(label)),"nextCursor":STR,"requestId":ID}, ("data","requestId"))
S["UsageUpdate"]["properties"]["usages"]["minItems"]=1
S["Register"]["properties"]["usages"]["minItems"]=1
S["AssignmentInput"]["properties"]["recipientWorkspaceIds"]["minItems"]=1
for name, left, right in (("TaskCreate","dueAt","dueDate"),("TaskUpdate","dueAt","dueDate"),("AssignmentInput","deadline","deadlineDate")):
    S[name]["not"]={"required":[left,right]}
S["SubmissionInput"]["properties"]["text"]={"type":"string","minLength":1}
S["SubmissionInput"]["properties"]["links"]["minItems"]=1
S["SubmissionInput"]["properties"]["uploadIds"]["minItems"]=1
S["SubmissionInput"]["anyOf"]=[{"required":[x]} for x in ("text","links","uploadIds")]

# method, path, request schema, response shape, permission family.
O = [
 ("post","/auth/register","Register","AccountResult","auth"),
 ("post","/auth/login","Login","AccountResult","auth"),
 ("post","/auth/logout",None,"Result","auth"),
 ("post","/auth/password-reset-request","PasswordResetRequest","Result","auth"),
 ("post","/auth/password-reset","PasswordReset","Result","auth"),
 ("get","/me",None,"Result","account"), ("patch","/me/usages","UsageUpdate","Result","account"),
 ("get","/me/tasks",None,"TaskListResult","task"),
 ("get","/me/events",None,"EventListResult","event"),
 ("get","/classes",None,"ListResult","class"), ("post","/classes","ClassCreate","Result","class"),
 ("get","/classes/{classId}",None,"Result","class"), ("get","/classes/{classId}/members",None,"ListResult","class"),
 ("get","/classes/{classId}/join-requests",None,"ListResult","membership"),
 ("get","/me/invitations",None,"ListResult","membership"),
 ("post","/classes/{classId}/archive",None,"Result","class"), ("post","/classes/{classId}/restore",None,"Result","class"),
 ("post","/classes/{classId}/join-requests","JoinClass","Result","membership"),
 ("post","/classes/{classId}/join-code","JoinCode","Result","class"),
 ("post","/classes/{classId}/invitations","InvitationCreate","Result","membership"),
 ("post","/class-invitations/{invitationId}/accept",None,"Result","membership"),
 ("post","/class-invitations/{invitationId}/decline",None,"Result","membership"),
 ("post","/class-join-requests/{requestId}/approve",None,"Result","membership"),
 ("post","/class-join-requests/{requestId}/decline",None,"Result","membership"),
 ("get","/classes/{classId}/groups",None,"ListResult","membership"),
 ("post","/classes/{classId}/groups","GroupCreate","Result","membership"),
 ("post","/groups/{groupId}/invitations","InvitationCreate","Result","membership"),
 ("post","/groups/{groupId}/join-requests",None,"Result","membership"),
 ("get","/groups/{groupId}/join-requests",None,"ListResult","membership"),
 ("post","/group-invitations/{invitationId}/accept",None,"Result","membership"),
 ("post","/group-invitations/{invitationId}/decline",None,"Result","membership"),
 ("post","/group-join-requests/{requestId}/approve",None,"Result","membership"),
 ("post","/group-join-requests/{requestId}/decline",None,"Result","membership"),
 ("post","/groups/{groupId}/leave","Handover","Result","membership"),
 ("post","/classes/{classId}/leave","Handover","Result","membership"),
 ("post","/classes/{classId}/remove-member","RemoveMember","Result","membership"),
 ("post","/groups/{groupId}/remove-member","RemoveMember","Result","membership"),
 ("patch","/groups/{groupId}/leader","LeaderChange","Result","membership"),
 ("get","/workspaces",None,"ListResult","workspace"), ("post","/workspaces","GroupCreate","Result","workspace"),
 ("get","/workspaces/{workspaceId}",None,"Result","workspace"),
 ("post","/workspaces/{workspaceId}/archive",None,"Result","workspace"),
 ("post","/workspaces/{workspaceId}/restore",None,"Result","workspace"),
 ("post","/workspaces/{workspaceId}/ownership-transfers","Transfer","Result","workspace"),
 ("post","/classes/{classId}/ownership-transfers","Transfer","Result","class"),
 ("post","/ownership-transfers/{transferId}/accept",None,"Result","workspace"),
 ("get","/classes/{classId}/policy",None,"Result","grant"),
 ("patch","/classes/{classId}/policy","Policy","Result","grant"),
 ("post","/grants","GrantInput","Result","grant"), ("delete","/grants/{grantId}",None,"Result","grant"),
 ("get","/workspaces/{workspaceId}/tasks",None,"ListResult","task"),
 ("get","/tasks/{taskId}",None,"Result","task"),
 ("post","/workspaces/{workspaceId}/tasks","TaskCreate","Result","task"),
 ("post","/tasks/bulk-actions","BulkTasks","Result","task"),
 ("patch","/tasks/{taskId}","TaskUpdate","Result","task"),
 ("post","/tasks/{taskId}/reassign","Reassign","Result","task"),
 ("post","/tasks/{taskId}/complete",None,"Result","task"), ("post","/tasks/{taskId}/reopen",None,"Result","task"),
 ("post","/tasks/{taskId}/checklist-items","Checklist","Result","task"),
 ("patch","/tasks/{taskId}/checklist-items/{itemId}","Checklist","Result","task"),
 ("delete","/tasks/{taskId}/checklist-items/{itemId}",None,"Result","task"),
 ("get","/me/work-sessions",None,"ListResult","task"),
 ("post","/me/work-sessions","WorkSession","Result","task"),
 ("patch","/me/work-sessions/{sessionId}","WorkSession","Result","task"),
 ("delete","/me/work-sessions/{sessionId}",None,"Result","task"),
 ("get","/events",None,"ListResult","event"), ("post","/events","EventInput","Result","event"),
 ("get","/events/{eventId}",None,"Result","event"),
 ("patch","/events/{eventId}","EventInput","Result","event"),
 ("post","/events/{eventId}/cancel",None,"Result","event"),
 ("get","/workspaces/{workspaceId}/library/items",None,"ListResult","library"),
 ("get","/library/items/{itemId}",None,"Result","library"),
 ("post","/me/inbox/items","LibraryItem","LibraryResult","library"),
 ("post","/workspaces/{workspaceId}/library/items","LibraryItem","Result","library"),
 ("patch","/library/items/{itemId}","LibraryItem","Result","library"),
 ("post","/library/items/{itemId}/revisions","LibraryItem","Result","library"),
 ("post","/library/items/{itemId}/copies","Copy","Result","library"),
 ("post","/library/items/{itemId}/trash",None,"Result","library"),
 ("post","/library/items/{itemId}/restore",None,"Result","library"),
 ("get","/library/items/{itemId}/download",None,"Result","library"),
 ("get","/workspaces/{workspaceId}/folders",None,"ListResult","library"),
 ("post","/workspaces/{workspaceId}/folders","FolderInput","Result","library"),
 ("patch","/folders/{folderId}","FolderInput","Result","library"),
 ("delete","/folders/{folderId}",None,"Result","library"),
 ("post","/uploads","UploadStart","Result","upload"),
 ("put","/uploads/{uploadId}/content","binary","Result","upload"),
 ("get","/classes/{classId}/assignments",None,"ListResult","assignment"),
 ("get","/assignments/{assignmentId}",None,"Result","assignment"),
 ("post","/classes/{classId}/assignments","AssignmentInput","Result","assignment"),
 ("post","/assignments/{assignmentId}/archive",None,"Result","assignment"),
 ("patch","/assignments/{assignmentId}","AssignmentInput","Result","assignment"),
 ("get","/assignments/{assignmentId}/recipients",None,"ListResult","assignment"),
 ("post","/assignment-recipients/{recipientId}/updates","Update","Result","assignment"),
 ("get","/assignment-recipients/{recipientId}/submissions",None,"ListResult","submission"),
 ("get","/submissions/{submissionId}",None,"Result","submission"),
 ("post","/assignment-recipients/{recipientId}/submissions","SubmissionInput","Result","submission"),
 ("post","/submissions/{submissionId}/feedback","Feedback","Result","submission"),
 ("get","/operations/by-key/{key}",None,"Operation","submission"),
]

def operation(method, path, request, response, family):
    params=[]
    for part in path.split("/"):
        if part.startswith("{"):
            params.append({"name":part[1:-1],"in":"path","required":True,"schema":ID})
    typed=(family.title()+response) if family in entities and response in ("Result","ListResult") else response
    special={"/classes/{classId}/members":"MembershipListResult",
             "/classes/{classId}/groups":"WorkspaceListResult",
             "/classes/{classId}/groups#post":"WorkspaceResult",
             "/classes/{classId}/policy":"Result",
             "/assignments/{assignmentId}/recipients":"RecipientListResult",
             "/assignment-recipients/{recipientId}/updates":"RecipientResult",
             "/me/work-sessions":"WorksessionListResult",
             "/workspaces/{workspaceId}/folders":"FolderListResult",
             "/library/items/{itemId}/download":"DownloadResult"}
    if path=="/tasks/bulk-actions": typed="TaskListResult"
    typed=special.get(path+"#"+method,special.get(path,typed))
    if path.startswith("/me/work-sessions/") or (path=="/me/work-sessions" and method=="post"):
        typed="WorksessionResult"
    if path.startswith("/folders/") or (path=="/workspaces/{workspaceId}/folders" and method=="post"):
        typed="FolderResult"
    op={"operationId":family+method.title()+"".join(x.strip("{}").title() for x in path.split("/") if x),
        "tags":[family],"responses":{"200":{"description":"Committed result", "content":{"application/json":{"schema":ref(typed)}}}}}
    if params:op["parameters"]=params
    if method=="get" and response=="ListResult":
        op.setdefault("parameters",[]).extend([{"name":"cursor","in":"query","schema":STR},{"name":"limit","in":"query","schema":{"type":"integer","minimum":1,"maximum":100}}])
    if method=="get" and path=="/events":
        op.setdefault("parameters",[]).extend([{"name":n,"in":"query","schema":STR} for n in ("scopeType","scopeId","from","to")])
    if request:
        mime="application/octet-stream" if request=="binary" else "application/json"
        schema={"type":"string","format":"binary"} if request=="binary" else ref(request)
        op["requestBody"]={"required":True,"content":{mime:{"schema":schema}}}
    if method in ("post","patch","put","delete"):
        op["responses"]["409"]={"description":"Domain conflict", "content":{"application/json":{"schema":ref("Error")}}}
    if method in ("post","patch","put") and (family in ("submission","library","task","grant","assignment")):
        op["responses"]["412"]={"description":"Version conflict", "content":{"application/json":{"schema":ref("Error")}}}
    if method=="post" and path.endswith("/submissions"):
        op.setdefault("parameters",[]).append({"name":"Idempotency-Key","in":"header","required":True,"schema":ID})
    if method in ("post","patch","put","delete") and (not path.startswith("/auth/") or path=="/auth/logout"):
        op.setdefault("parameters",[]).append({"name":"X-CSRF-Token","in":"header","required":True,"schema":ID,"description":"Required for cookie authenticated mutations"})
    if method=="patch" or path.endswith("/revisions") or path.endswith("/submissions"):
        op.setdefault("parameters",[]).append({"name":"If-Match","in":"header","required":False,"schema":STR,"description":"Required when changing an existing revision; omitted on first submission"})
    return op

paths={}
for method,path,request,response,family in O:
    assert method not in paths.setdefault(path,{}), (method,path)
    paths[path][method]=operation(method,path,request,response,family)
spec={"openapi":"3.1.0","info":{"title":"SNOTE v2 REST", "version":"0.1.0", "description":"Contract baseline for web v2; domain invariants in docs/requirements. No v1 input."},
      "servers":[{"url":"/api/v2"}],"security":[{"sessionCookie":[]}],"paths":paths,
      "components":{"securitySchemes":{"sessionCookie":{"type":"apiKey","in":"cookie","name":"snote_session"}},"schemas":S}}
for path in ("/auth/register","/auth/login","/auth/password-reset-request","/auth/password-reset"):
    spec["paths"][path]["post"]["security"]=[]
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(yaml.safe_dump(spec,allow_unicode=True,sort_keys=False,default_flow_style=True,width=1000000))
print(f"{OUT}: {len(paths)} paths, {len(O)} operations, {len(S)} schemas")
