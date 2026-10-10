import {z} from 'zod';
export const supplyCategories=['Furniture and learning space','Boards and displays','Faith and Bible displays','Learning toys and manipulatives','Printing and preparation tools','Paper and printing supplies','Art and picture study','Storage and organization','Reading materials'] as const;
export const supplySchema=z.object({name:z.string().trim().min(1).max(300),category:z.enum(supplyCategories),quantity:z.string().trim().max(100).default(''),price:z.string().max(300).default(''),link:z.string().refine(s=>!s||/^https?:\/\//.test(s)&&URL.canParse(s),'Use a full http or https link').default(''),notes:z.string().max(3000).default(''),status:z.enum(['To buy','Bought']).default('To buy')});
export type Supply=z.infer<typeof supplySchema>&{id:string;added:string};
const rows:[string,typeof supplyCategories[number],string?,string?][]=[
['Chairs','Furniture and learning space'],
['White board','Boards and displays'],
['Cork board','Boards and displays'],
['Color mixing illustration / chromatic scale of colors','Boards and displays'],
['Alphabet / phonics illustration','Boards and displays'],
['3D shapes illustrations','Boards and displays'],
["The Lord’s Prayer",'Faith and Bible displays'],
['Bible verse','Faith and Bible displays'],
['Wooden rainbow stacker','Learning toys and manipulatives'],
['Wooden blocks','Learning toys and manipulatives'],
['Binding machine','Printing and preparation tools'],
['Laminating machine','Printing and preparation tools'],
['Extra printer inks','Paper and printing supplies'],
['A4 papers','Paper and printing supplies'],
['Multipurpose papers','Paper and printing supplies'],
['Art papers','Paper and printing supplies'],
['Books and novels','Reading materials','','Add individual titles in the Books section.'],
['Art baskets','Storage and organization','3'],
['White baskets for art and writing supplies','Storage and organization'],
['Closed cabinet for supplies','Storage and organization'],
['Shelf for books and supplies in use','Furniture and learning space'],
['Wooden name puzzles (Woodmark Toys)','Learning toys and manipulatives'],
['Math manipulatives','Learning toys and manipulatives'],
['Printed artworks for art app','Art and picture study'],
['Baskets for finished works','Storage and organization']];
export const initialSupplies:Supply[]=rows.map(([name,category,quantity='',notes=''],i)=>({id:`initial-supply-${i+1}`,name,category,quantity,notes,price:'',link:'',status:'To buy',added:'2026-10-05'}));
