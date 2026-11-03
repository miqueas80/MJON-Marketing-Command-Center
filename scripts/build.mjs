import {cp,mkdir,rm,writeFile} from 'node:fs/promises';
const out=new URL('../dist/',import.meta.url);
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const file of ['index.html','sw.js','manifest.webmanifest'])await cp(new URL(`../${file}`,import.meta.url),new URL(file,out));
for(const dir of ['src','assets'])await cp(new URL(`../${dir}/`,import.meta.url),new URL(dir+'/',out),{recursive:true});
await writeFile(new URL('.nojekyll',out),'');
console.log('Build static listo en dist/ (solo recursos públicos).');
