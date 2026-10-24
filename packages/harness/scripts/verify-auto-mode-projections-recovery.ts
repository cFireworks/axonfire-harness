import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Script } from "node:vm";
import { parse } from "acorn";
import ts from "typescript";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { ToolNames } from "../src/tools/tool-names.js";
import { nativeAutoClassifierTool, nativeEmptyAutoClassifierTool } from "../src/permissions/native-auto-mode-projections.js";
const source = await readFile(getCapturedBundlePath(), "utf8");
assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
function walk(node: any, visit: (node: any) => void) {
  if (!node || typeof node !== "object") return;
  visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(child => walk(child,visit));
    else if (value && typeof value === "object") walk(value,visit);
  }
}
const entries: any[] = [];
walk(parse(source,{ecmaVersion:"latest"}), node => {
  if (node.type !== "ClassExpression" && node.type !== "ClassDeclaration") return;
  const method = node.body.body.find((m:any) => m.key?.name === "toAutoClassifierInput");
  if (!method) return;
  let name: string | undefined;
  const ctor = node.body.body.find((m:any) => m.kind === "constructor");
  walk(ctor, assignment => {
    if (assignment.type !== "AssignmentExpression" || assignment.left?.object?.type !== "ThisExpression" || assignment.left?.property?.name !== "name") return;
    const right = assignment.right;
    if (right.type === "Literal") name = right.value;
    else if (right.object?.property?.name === "ToolNames") name = (ToolNames as any)[right.property.name];
  });
  if (!name) assert.equal(node.id?.name, "BaseTool");
  entries.push({name,method});
});
const port = ts.transpileModule(await readFile(new URL("../src/permissions/native-auto-mode-projections.ts",import.meta.url),"utf8"),{compilerOptions:{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.ESNext}}).outputText;
const methods:any[]=[];
walk(parse(port,{ecmaVersion:"latest",sourceType:"module"}),node=>{if(node.type==="Property"&&node.method&&node.key?.name==="toAutoClassifierInput")methods.push(node.value);});
function norm(node:any):any {
  if(Array.isArray(node))return node.map(norm);
  if(node&&typeof node==="object")return Object.fromEntries(Object.entries(node).filter(([key])=>!["start","end","raw"].includes(key)).map(([key,value])=>[key,norm(value)]));
  return node;
}
assert.equal(entries.length,16);assert.deepEqual(norm(methods),norm(entries.map(e=>e.method.value)));
const samples:any[]=[undefined,null,{},"owned",{command:"echo owned"},{file_path:"/owned/file",content:"new",new_string:"replacement"},{file_path:"/owned/file",content:1,new_string:null},{pattern:"owned",path:"/owned"},{pattern:"owned",path:""},{url:"https://owned.invalid",prompt:"owned prompt"},{query:"owned query"},{file_path:"/owned/file",edits:[{new_string:"one"},null,{new_string:"two"}]},{notebook_path:"/owned/a.ipynb",new_source:"code"},{notebook_path:"/owned/a.ipynb",edit_mode:"insert",new_source:"code"},{prompt:"owned task",subagent_type:"owned-child",mode:"plan"},{prompt:"owned task"},{task_id:7,shell_id:"fallback"},{shell_id:"owned-shell"},{cron:"* * * * *",prompt:"owned cron"},...['message','broadcast','shutdown_request','shutdown_response','plan_approval_response','unknown'].flatMap(type=>[{type,recipient:"owned",content:"body",approve:true},{type,approve:false}])];
let comparisons=0;
for(const {name,method}of entries){
 const original=new Script(`new (class{${source.slice(method.start,method.end)}})`).runInNewContext();
 const recovered=name?nativeAutoClassifierTool(name):nativeEmptyAutoClassifierTool("owned-empty");
 assert.ok(recovered,name);
 for(const input of samples){assert.deepEqual(recovered.toAutoClassifierInput(input),original.toAutoClassifierInput(input),JSON.stringify({name,input}));comparisons++;}
}
assert.equal(nativeAutoClassifierTool("owned-unknown"),undefined);
console.log(JSON.stringify({passed:true,completeProjectionMethods:entries.length,comparisons},null,2));
