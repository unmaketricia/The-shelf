'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {CalendarDays,Clock3,MapPin,Pencil,Plus,Trash2,X} from 'lucide-react';
import {classSubjects,displayClassDate,displayClassTime,type ClassDraft,type HomeschoolClass} from '@/lib/classes';

const blank:ClassDraft={name:'',address:'',subject:'Music',date:'',time:''};

export default function Classes({canEdit}:{canEdit:boolean}){
  const [items,setItems]=useState<HomeschoolClass[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<HomeschoolClass|null>(null);
  const [draft,setDraft]=useState<ClassDraft>(blank);
  const [saving,setSaving]=useState(false);
  const [removing,setRemoving]=useState<string|null>(null);
  const [formError,setFormError]=useState('');
  const dialog=useRef<HTMLDialogElement>(null);

  const refresh=useCallback(async(signal?:AbortSignal)=>{
    setError('');
    try{
      const response=await fetch('/api/classes',{cache:'no-store',signal});
      if(!response.ok){const data=await response.json() as {error?:string};throw new Error(data.error||'Could not load classes.');}
      const data=await response.json() as HomeschoolClass[];
      setItems(data);
    }catch(error){if((error as Error).name!=='AbortError')setError((error as Error).message);}
    finally{if(!signal?.aborted)setLoading(false);}
  },[]);

  useEffect(()=>{const controller=new AbortController();void refresh(controller.signal);return ()=>controller.abort();},[refresh]);
  useEffect(()=>{
    if(open&&!dialog.current?.open)dialog.current?.showModal();
    if(!open&&dialog.current?.open)dialog.current.close();
  },[open]);

  function start(item?:HomeschoolClass){
    setEditing(item||null);
    setDraft(item?{name:item.name,address:item.address,subject:item.subject,date:item.date,time:item.time}:{...blank});
    setFormError('');setOpen(true);
  }
  async function save(event:React.FormEvent){
    event.preventDefault();if(saving)return;setSaving(true);setFormError('');
    try{
      const response=await fetch('/api/classes',{method:editing?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...draft,id:editing?.id})});
      const result=await response.json() as {error?:string};
      if(!response.ok)throw new Error(result.error||'Could not save this class.');
      setOpen(false);setNotice(editing?'Class updated':'Class added');await refresh();
    }catch(error){setFormError((error as Error).message);}
    finally{setSaving(false);}
  }
  async function remove(item:HomeschoolClass){
    if(!confirm(`Remove “${item.name}” from Classes & Workshops?`))return;
    setRemoving(item.id);setError('');
    try{
      const response=await fetch('/api/classes',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id})});
      if(!response.ok){const result=await response.json() as {error?:string};throw new Error(result.error||'Could not remove this class.');}
      setNotice('Class removed');await refresh();
    }catch(error){setError((error as Error).message);}
    finally{setRemoving(null);}
  }

  return <section className="content classes-content">
    <div className="heading"><div><p className="eyebrow">HOMESCHOOL ACTIVITIES</p><h1>Classes &amp; Workshops</h1></div>{canEdit&&<button className="primary" onClick={()=>start()}><Plus size={20}/> Add class / workshop</button>}</div>
    {notice&&<p className="notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={()=>setNotice('')}><X size={16}/></button></p>}
    {error&&<div className="error" role="alert">{error} <button onClick={()=>void refresh()}>Try again</button></div>}
    {loading?<p className="empty">Loading classes and workshops…</p>:!items.length?<div className="empty"><CalendarDays size={32}/><h2>No classes or workshops yet</h2>{canEdit&&<p>Add a class with its address, subject, date and time.</p>}</div>:<div className="class-list">{items.map(item=><article className="class-card" key={item.id}>
      <span className="subject-tag">{item.subject}</span><h2>{item.name}</h2>
      <p className="class-detail"><MapPin size={18} aria-hidden="true"/><span>{item.address||'Address not added'}</span></p>
      <div className="class-schedule"><p className="class-detail"><CalendarDays size={18} aria-hidden="true"/><time dateTime={item.date}>{displayClassDate(item.date)}</time></p><p className="class-detail"><Clock3 size={18} aria-hidden="true"/><time dateTime={item.time}>{displayClassTime(item.time)}</time></p></div>
      {canEdit&&<div className="actions class-actions"><button disabled={removing===item.id} onClick={()=>start(item)} aria-label={`Edit ${item.name}`}><Pencil size={17}/> Edit</button><button disabled={removing===item.id} onClick={()=>void remove(item)} aria-label={`Remove ${item.name}`}><Trash2 size={17}/>{removing===item.id?'Removing…':'Remove'}</button></div>}
    </article>)}</div>}
    <dialog ref={dialog} className="modal supply-dialog" aria-labelledby="class-form-title" onCancel={event=>{if(saving)event.preventDefault();else setOpen(false);}}>
      <div className="modal-title"><h2 id="class-form-title">{editing?'Edit class / workshop':'Add class / workshop'}</h2><button disabled={saving} onClick={()=>setOpen(false)} aria-label="Close form"><X/></button></div>
      <form onSubmit={save}><fieldset className="book-fields" disabled={saving}>
        <label>Name<input autoFocus required maxLength={300} value={draft.name} onChange={event=>setDraft({...draft,name:event.target.value})}/></label>
        <label>Address<textarea rows={2} maxLength={1000} placeholder="Venue and full address, or Online" value={draft.address} onChange={event=>setDraft({...draft,address:event.target.value})}/></label>
        <label>Subject<select value={draft.subject} onChange={event=>setDraft({...draft,subject:event.target.value as ClassDraft['subject']})}>{classSubjects.map(subject=><option key={subject}>{subject}</option>)}</select></label>
        <div className="class-date-time"><label>Date<input type="date" required value={draft.date} onChange={event=>setDraft({...draft,date:event.target.value})}/></label><label>Time<input type="time" required value={draft.time} onChange={event=>setDraft({...draft,time:event.target.value})}/></label></div>
        {formError&&<p className="error" role="alert">{formError}</p>}
        <div className="form-buttons"><button type="button" onClick={()=>setOpen(false)}>Cancel</button><button className="primary">{saving?'Saving…':'Save class'}</button></div>
      </fieldset></form>
    </dialog>
  </section>;
}
