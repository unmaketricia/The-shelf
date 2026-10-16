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

export const classSchema = z.object({
  name: z.string().trim().min(1,'Enter the class or workshop name.').max(300),
  address: z.string().trim().max(1000).default(''),
  subject: z.enum(classSubjects),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,'Choose a date.').refine(value => {
    const date = new Date(value+'T00:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10)===value;
  },'Choose a valid date.'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/,'Choose a valid time.'),
});

export type ClassDraft = z.infer<typeof classSchema>;
export type HomeschoolClass = ClassDraft & {id:string;added:string};

export function displayClassDate(date:string){
  return new Intl.DateTimeFormat('en-PH',{weekday:'short',month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'));
}
export function displayClassTime(time:string){
  const [hours,minutes] = time.split(':').map(Number);
  return `${hours%12||12}:${String(minutes).padStart(2,'0')} ${hours<12?'AM':'PM'}`;
}
