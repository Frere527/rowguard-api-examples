import {readFileSync} from 'node:fs';
const base=process.env.RAPIDAPI_BASE_URL;
if(!base?.startsWith('https://')||!process.env.RAPIDAPI_KEY||!process.env.RAPIDAPI_HOST)throw new Error('Set RAPIDAPI_BASE_URL, RAPIDAPI_KEY and RAPIDAPI_HOST.');
const payload=JSON.parse(readFileSync(new URL('./request.json',import.meta.url),'utf8'));
const response=await fetch(new URL('/v1/validate',base),{
 method:'POST',headers:{'content-type':'application/json','x-rapidapi-key':process.env.RAPIDAPI_KEY,'x-rapidapi-host':process.env.RAPIDAPI_HOST},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)
});
if(!response.ok)throw new Error(`HTTP ${response.status}; retry-after ${response.headers.get('retry-after')??'n/a'}`);
const result=await response.json();console.log(JSON.stringify(result,null,2));
if(!result.valid)console.log('Review errors before import.');
