import {Pool, type PoolClient} from 'pg';
import {translateSQL} from './sql.ts';
const schema = "the_shelf";
let pool: Pool | undefined;
function connection(){
 if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is not configured');
 return pool ??= new Pool({connectionString:process.env.DATABASE_URL,max:3,idleTimeoutMillis:20000,connectionTimeoutMillis:10000,ssl:{rejectUnauthorized:true}});
}
type Row=Record<string,unknown>;
class Statement {
 constructor(readonly sql:string,readonly values:unknown[]=[]){ }
 bind(...values:unknown[]){return new Statement(this.sql,values);}
 async execute(client?:PoolClient){return (client??connection()).query(translateSQL(this.sql,schema),this.values);}
 async first<T=Row>():Promise<T|null>{const r=await this.execute();return (r.rows[0] as T)??null;}
 async all<T=Row>(){const r=await this.execute();return {results:r.rows as T[]};}
 async run(){const r=await this.execute();return {meta:{changes:r.rowCount??0}};}
}
export function database(){return {
 prepare:(sql:string)=>new Statement(sql),
 async batch(statements:Statement[]){const c=await connection().connect();try{await c.query('BEGIN');const results=[];for(const s of statements){const r=await s.execute(c);results.push({results:r.rows,meta:{changes:r.rowCount??0}});}await c.query('COMMIT');return results;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}
};}
