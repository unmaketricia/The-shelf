import {requireShelfEditor} from '@/lib/access';
import {database} from '@/db/raw';
import {classSchema} from '@/lib/classes';

export const dynamic='force-dynamic';
function sameOrigin(r:Request){const origin=r.headers.get('origin');return !origin||origin===new URL(r.url).origin;}

export async function GET(){
  try{
    const result=await database().prepare("SELECT id,name,address,subject,to_char(scheduled_date,'YYYY-MM-DD') AS date,to_char(scheduled_time,'HH24:MI') AS time,added FROM classes ORDER BY scheduled_date,scheduled_time,name").all();
    return Response.json(result.results,{headers:{'Cache-Control':'no-store'}});
  }catch(error){
    console.error('Classes could not load',error);
    return Response.json({error:'Your classes could not load. Please try again.'},{status:503});
  }
}
export async function POST(r:Request){return write(r,false);}
export async function PUT(r:Request){return write(r,true);}

async function write(r:Request,editing:boolean){
  const denied=await requireShelfEditor();if(denied)return denied;
  if(!sameOrigin(r))return Response.json({error:'Request not allowed.'},{status:403});
  try{
    const input=await r.json() as Record<string,unknown>;
    const parsed=classSchema.safeParse(input);
    if(!parsed.success)return Response.json({error:parsed.error.issues[0].message},{status:400});
    const item=parsed.data;
    const id=editing?input.id:crypto.randomUUID();
    if(typeof id!=='string'||!id||id.length>100)return Response.json({error:'Missing or invalid class ID.'},{status:400});
    const values=[item.name,item.address,item.subject,item.date,item.time];
    const result=editing
      ?await database().prepare('UPDATE classes SET name=?,address=?,subject=?,scheduled_date=?,scheduled_time=? WHERE id=?').bind(...values,id).run()
      :await database().prepare('INSERT INTO classes (id,name,address,subject,scheduled_date,scheduled_time,added) VALUES (?,?,?,?,?,?,?)').bind(id,...values,new Date().toISOString()).run();
    if(editing&&!result.meta.changes)return Response.json({error:'This class no longer exists. Reload the list.'},{status:404});
    return Response.json({id});
  }catch(error){
    console.error('Class could not save',error);
    return Response.json({error:'Could not save your class. Your form is still here; please try again.'},{status:503});
  }
}

export async function DELETE(r:Request){
  const denied=await requireShelfEditor();if(denied)return denied;
  if(!sameOrigin(r))return Response.json({error:'Request not allowed.'},{status:403});
  try{
    const input=await r.json() as Record<string,unknown>;
    if(typeof input.id!=='string'||!input.id||input.id.length>100)return Response.json({error:'Missing or invalid class ID.'},{status:400});
    await database().prepare('DELETE FROM classes WHERE id=?').bind(input.id).run();
    return Response.json({ok:true});
  }catch(error){
    console.error('Class could not remove',error);
    return Response.json({error:'Could not remove this class. Please try again.'},{status:503});
  }
}
