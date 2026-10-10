import {canEditShelf} from '@/lib/access';
export const dynamic='force-dynamic';
export async function GET(){return Response.json({canEdit:await canEditShelf()},{headers:{'Cache-Control':'no-store'}});}
