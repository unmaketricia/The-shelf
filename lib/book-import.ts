import {subjects} from './books';
export function clean(value:unknown,max=5000):string {
 if(typeof value!=='string')return '';
 return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi,(_,s:string)=>{if(s[0]==='#'){const n=s[1].toLowerCase()==='x'?parseInt(s.slice(2),16):parseInt(s.slice(1),10);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}return ({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '} as Record<string,string>)[s.toLowerCase()]||'';}).replace(/\s+/g,' ').trim().slice(0,max);
}
function attrs(tag:string){const result:Record<string,string>={};for(const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g))result[m[1].toLowerCase()]=m[2]??m[3]??m[4];return result;}
export function extractBook(html:string){
 const meta:Record<string,string>={};for(const m of html.matchAll(/<meta\b[^>]*>/gi)){const a=attrs(m[0]);const key=a.property||a.name||a.itemprop;if(key&&a.content)meta[key.toLowerCase()]=clean(a.content);}
 const nodes:any[]=[];function walk(v:any,depth=0){if(!v||typeof v!=='object'||depth>12||nodes.length>2000)return;if(!Array.isArray(v))nodes.push(v);for(const child of Object.values(v))if(child&&typeof child==='object')walk(child,depth+1);}
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(attrs(m[1]).type?.toLowerCase()==='application/ld+json'){try{walk(JSON.parse(m[2]));}catch{/* malformed publisher metadata is optional */}}}
 const typed=(x:any,t:string)=>[x?.['@type']].flat().some(s=>typeof s==='string'&&(s===t||s.endsWith('/'+t)));
 const product=nodes.find(x=>typed(x,'Product')&&x.name)||nodes.find(x=>typed(x,'Book')&&x.name);
 const book=nodes.find(x=>typed(x,'Book')&&x.name===product?.name)||product;
 const title=clean(product?.name||meta['og:title']||meta['twitter:title']||html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],300);
 const description=clean(product?.description||meta['og:description']||meta.description||meta['twitter:description']);
 const authors=[book?.author||meta['book:author']||meta.author].flat().filter(Boolean).map(a=>clean(typeof a==='object'?a.name:a,300)).filter(Boolean).join(', ').slice(0,300);
 const offers=[product?.offers].flat().filter(Boolean);const offer=offers.find(o=>o.price!==undefined)||offers[0];
 const currency=clean(offer?.priceCurrency||meta['product:price:currency']||meta['og:price:currency'],12);
 const amount=offer?.price??offer?.lowPrice??meta['product:price:amount']??meta['og:price:amount']??meta.price;
 const price=amount!==undefined&&amount!==''?`${currency?currency+' ':''}${clean(String(amount),80)}${offer?.highPrice&&offer.highPrice!==offer.lowPrice&&offer.price===undefined?' – '+clean(String(offer.highPrice),80):''}`:'';
 const text=(title+' '+description).toLowerCase();let subject:typeof subjects[number]|undefined;
 if(/\bbible\b|story bible|old testament|new testament/.test(text))subject='Bible';
 else if(/\bphonics\b|\bgrammar\b/.test(text))subject='English, grammar, and writing';
 else if(/\bmathematics\b|\bmath workbook\b/.test(text))subject='Mathematics';
 else if(/\bpoetry\b|\bpoems\b/.test(text))subject='Poetry';
 else if(/\batlas\b|\bgeography\b/.test(text))subject='Geography';
 return {title,author:authors,description,price,subject};
}
export function publicUrl(raw:string){
 const u=new URL(raw);const h=u.hostname.toLowerCase().replace(/\.$/,'');
 if(!['https:','http:'].includes(u.protocol)||u.username||u.password||u.port&&!['80','443'].includes(u.port)||!h.includes('.')||/^[\d.]+$/.test(h)||h.includes(':')||/(^|\.)(localhost|local|internal|test|invalid|example|onion|arpa)$/.test(h)||h.endsWith('.localhost'))throw Error('Use a public bookstore or publisher link, starting with https://.');
 return u;
}
function publicIP(ip:string){if(ip.includes(':'))return /^(2|3)[\da-f]{3}:/i.test(ip)&&!/^2001:(db8|0:|10:)/i.test(ip);const a=ip.split('.').map(Number);return a.length===4&&a.every(n=>n>=0&&n<256)&&a[0]!==0&&a[0]!==10&&a[0]!==127&&a[0]<224&&!(a[0]===169&&a[1]===254)&&!(a[0]===172&&a[1]>=16&&a[1]<=31)&&!(a[0]===192&&(a[1]===168||a[1]===0||a[1]===2))&&!(a[0]===100&&a[1]>=64&&a[1]<=127)&&!(a[0]===198&&(a[1]===18||a[1]===19||a[1]===51))&&!(a[0]===203&&a[1]===0&&a[2]===113);}
async function verifyHost(url:URL,signal:AbortSignal){const r=await fetch('https://cloudflare-dns.com/dns-query?name='+encodeURIComponent(url.hostname)+'&type=A',{headers:{accept:'application/dns-json'},signal});if(!r.ok)throw Error('Could not check this website. Try again later.');const dns:any=await r.json();const ips=(dns.Answer||[]).filter((a:any)=>a.type===1).map((a:any)=>a.data);if(!ips.length||ips.some((ip:string)=>!publicIP(ip)))throw Error('This link must point to a public website.');}
export async function fetchPage(raw:string){
 const signal=AbortSignal.timeout(18000);let url=publicUrl(raw);
 for(let redirect=0;redirect<5;redirect++){
  await verifyHost(url,signal);
  const r=await fetch(url.href,{redirect:'manual',signal,headers:{Accept:'text/html,application/xhtml+xml','User-Agent':'TheShelf/1.0 (book metadata reader)'}});
  if(r.status>=300&&r.status<400){const location=r.headers.get('location');await r.body?.cancel();if(!location)throw Error('This link redirects without a destination.');url=publicUrl(new URL(location,url).href);continue;}
  if(!r.ok){await r.body?.cancel();throw Error('This website could not be read automatically. You can still enter the book details below.');}
  if(!r.headers.get('content-type')?.includes('text/html')&&!r.headers.get('content-type')?.includes('application/xhtml+xml')){await r.body?.cancel();throw Error('Paste a book product page, not a download or image link.');}
  const reader=r.body?.getReader();if(!reader)throw Error('This page has no readable details.');const decoder=new TextDecoder();let html='',size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>2_000_000){await reader.cancel();throw Error('This page is too large to import. Please enter the details manually.');}html+=decoder.decode(value,{stream:true});}html+=decoder.decode();return {html,url:url.href};
 }
 throw Error('This link has too many redirects. Try the bookstore’s direct product link.');
}
