import {z} from 'zod';

export const classSubjects = [
  'Bible and character formation',
  'English and reading',
  'Grammar and writing',
  'Literature',
  'Poetry',
  'Filipino',
  'Mathematics',
  'Science and nature study',
  'History / Araling Panlipunan',
  'Geography',
  'Art and picture study',
  'Music',
  'Physical education',
  'Health',
  'Handicrafts and life skills',
  'Foreign language',
  'Theatre and drama',
  'Dance',
  'Computer and robotics',
  'Other',
] as const;

export const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] as const;
const timeSchema = z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/,'Choose a valid time.').default('');
export const classSchema = z.object({
  name: z.string().trim().min(1,'Enter the class or workshop name.').max(300),
  address: z.string().trim().max(1000).default(''),
  subject: z.enum(classSubjects),
  schedule: z.array(z.object({day:z.enum(weekdays),time:timeSchema})).max(7)
    .refine(value=>new Set(value.map(entry=>entry.day)).size===value.length,'Choose each weekday only once.')
    .default([]).transform(value=>[...value].sort((a,b)=>weekdays.indexOf(a.day)-weekdays.indexOf(b.day))),
  monthlyFee: z.string().trim().max(300).default(''),
  annualFee: z.string().trim().max(300).default(''),
});

export type ClassDraft = z.infer<typeof classSchema>;
export type HomeschoolClass = ClassDraft & {id:string;added:string};

export function displayClassTime(time:string){
  const [hours,minutes] = time.split(':').map(Number);
  return `${hours%12||12}:${String(minutes).padStart(2,'0')} ${hours<12?'AM':'PM'}`;
}
