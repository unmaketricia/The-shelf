import {test} from 'node:test';
import assert from 'node:assert/strict';
import {translateSQL} from '../lib/sql.ts';
test('class schedules use the private app schema and keep date/time formats intact',()=>assert.equal(translateSQL("SELECT to_char(scheduled_date,'YYYY-MM-DD') AS date FROM classes WHERE id=?",'the_shelf'),`SELECT to_char(scheduled_date,'YYYY-MM-DD') AS date FROM "the_shelf"."classes" WHERE id=$1`));
test('parameters preserve quoted question marks',()=>assert.equal(translateSQL("SELECT '?' FROM books WHERE id=?",'the_shelf'),`SELECT '?' FROM "the_shelf"."books" WHERE id=$1`));
test('insert-ignore becomes non-destructive conflict handling',()=>assert.equal(translateSQL('INSERT OR IGNORE INTO budget_state (id,payload) VALUES (?,?)','kaching'),`INSERT INTO "kaching"."budget_state" (id,payload) VALUES ($1,$2) ON CONFLICT DO NOTHING`));
test('joins preserve aliases and references',()=>assert.equal(translateSQL("SELECT s.token_hash FROM app_lock_sessions s JOIN app_lock a ON a.id='home' WHERE s.expires_at>?",'kaching'),`SELECT s.token_hash FROM "kaching"."app_lock_sessions" s JOIN "kaching"."app_lock" a ON a.id='home' WHERE s.expires_at>$1`));
test('upserts preserve table references',()=>assert.match(translateSQL('INSERT INTO entries (id,kind,data) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data WHERE entries.kind=excluded.kind','the_table'),/WHERE entries.kind=excluded.kind$/));
