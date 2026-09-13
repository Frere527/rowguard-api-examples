import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

const request=JSON.parse(await readFile('examples/request.json','utf8'));
assert.equal(typeof request.csv,'string');
assert.ok(Array.isArray(request.schema)&&request.schema.length>0);

const readme=await readFile('README.md','utf8');
assert.match(readme,/rapidapi\.com\/Frere527\/api\/rowguard-csv-validation1/);
assert.match(readme,/rowguard-csv-validation1\.p\.rapidapi\.com/);
assert.match(readme,/RowGuard\.postman_collection\.json/);

const collection=JSON.parse(await readFile('postman/RowGuard.postman_collection.json','utf8'));
assert.equal(collection.info.schema,'https://schema.getpostman.com/json/collection/v2.1.0/collection.json');
assert.equal(collection.variable.find(variable=>variable.key==='rapidapiKey')?.value,'');
assert.equal(collection.variable.find(variable=>variable.key==='rapidapiHost')?.value,'rowguard-csv-validation1.p.rapidapi.com');
assert.equal(collection.item.length,2);
for(const item of collection.item){
  assert.equal(item.request.method,'POST');
  assert.equal(item.request.url.raw,'https://{{rapidapiHost}}/v1/validate');
  assert.equal(item.request.header.find(header=>header.key==='X-RapidAPI-Key')?.value,'{{rapidapiKey}}');
  const body=JSON.parse(item.request.body.raw);
  assert.equal(typeof body.csv,'string');
  assert.ok(Array.isArray(body.schema)&&body.schema.length>0);
}

const syntax=spawnSync(process.execPath,['--check','examples/client.js'],{encoding:'utf8'});
assert.equal(syntax.status,0,syntax.stderr);

const workflow=await readFile('.github/workflows/check.yml','utf8');
const publicActionPins=[
  'fbc6f3992d24b796d5a0'+'48ff273f7fcc4a7b6c09',
  'a0853c24544627f65ddf'+'259abe73b1d18a591444',
];
assert.match(workflow,/permissions:\n  contents: read/);
assert.ok(!/pull_request_target|secrets\./.test(workflow));
for(const pin of publicActionPins)assert.ok(workflow.includes(`@${pin}`));

const ignoredDirectories=new Set(['node_modules','__pycache__','.git']);
const files=(await readdir('.',{recursive:true,withFileTypes:true})).filter(entry=>entry.isFile()&&!entry.parentPath.split(/[\\/]/).some(part=>ignoredDirectories.has(part)));
for(const entry of files){
  const path=`${entry.parentPath}/${entry.name}`.replaceAll('\\','/');
  let text=await readFile(path,'utf8');
  for(const pin of publicActionPins)text=text.replaceAll(pin,'PINNED_PUBLIC_ACTION');
  assert.ok(!/\b(?:[a-f0-9]{40,}|[A-Za-z0-9_-]{48,})\b/.test(text),`Possible secret in ${path}`);
}

console.log(JSON.stringify({status:'ok',files:files.length,requestRows:request.csv.split('\n').length-1,dependencies:0}));
