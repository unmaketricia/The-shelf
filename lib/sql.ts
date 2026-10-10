// Converts the application's existing parameterized queries to PostgreSQL.
// SQL comes exclusively from server source; values always remain parameters.
export function translateSQL(input:string,schema:string){
 if(!/^[a-z_]+$/.test(schema))throw new Error('Invalid database schema');
 let sql=input.trim().replace(/;$/,'');
 const ignore=/^INSERT OR IGNORE /i.test(sql);
 sql=sql.replace(/^INSERT OR IGNORE /i,'INSERT ');
 // Qualify table references, while leaving column/alias references untouched.
 sql=sql.replace(/\b(FROM|JOIN|INTO|UPDATE|TABLE IF NOT EXISTS)\s+(app_lock_sessions|app_lock|budget_state|entries|books|settings|supplies)\b/gi,(_,keyword,table)=>`${keyword} "${schema}"."${table}"`);
 if(ignore)sql+=' ON CONFLICT DO NOTHING';
 let index=0;
 sql=sql.replace(/'(?:''|[^'])*'|\?/g,token=>token==='?'?`$${++index}`:token);
 return sql;
}
