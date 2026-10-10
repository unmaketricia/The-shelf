import {requireShelfEditor} from '@/lib/access';
import {extractBook,fetchPage} from '@/lib/book-import';
export async function POST(r:Request){
 const denied=await requireShelfEditor();if(denied)return denied;
 if(r.headers.get('origin')&&r.headers.get('origin')!==new URL(r.url).origin)return new Response('Forbidden',{status:403});
 try{
  const input:any=await r.json();if(typeof input.link!=='string'||input.link.length>3000)return Response.json({error:'Paste a full resource link.'},{status:400});
  const {html}=await fetchPage(input.link);const details=extractBook(html);
  if(!details.title||/just a moment|access denied|robot check|captcha|verify you are human/i.test(details.title))return Response.json({error:'This site did not provide readable resource details. Please fill them in manually below.'},{status:422});
  const missing=['author','description','price'].filter(k=>!details[k as keyof typeof details]);
  return Response.json({details,notes:`Details imported from ${new URL(input.link).hostname} on ${new Date().toISOString().slice(0,10)}. Verify the selected edition, currency and price; shipping and taxes may be extra.`,message:`Details filled in. Review before saving.${missing.length?' Not found: '+missing.join(', ')+'.':''}${details.subject?' Subject suggested; you can change it.':''}`},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Book link import failed',e instanceof Error?e.message:'Unknown error');return Response.json({error:e instanceof Error&&e.name==='TimeoutError'?'The website took too long to respond. Try again or enter the details manually.':e instanceof Error?e.message:'Unable to import this link. Please enter the details manually.'},{status:422});}
}
