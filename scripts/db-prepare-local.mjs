// @ts-check

/** Rebuild the local public schema from the production dump for testing only. */

import {execFile} from 'node:child_process';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const dump = path.join(root, 'tmp', 'pde_tanya-prod.dump');
const required = (name) => process.env[name] || (() => { throw new Error(`Missing ${name}.`); })();
const host = required('TEQFW_DB__HOST');
const port = required('TEQFW_DB__PORT');
const database = required('TEQFW_DB__DATABASE');
const user = required('TEQFW_DB__USER');
const env = {...process.env, PGPASSWORD: required('TEQFW_DB__PASSWORD')};

await fs.access(dump);
await run('psql', ['-h', host, '-p', port, '-U', user, '-d', database, '-c', 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'], {cwd: root, env});
await run('pg_restore', ['--no-owner', '--no-privileges', '-h', host, '-p', port, '-U', user, '-d', database, dump], {cwd: root, env});
await run('psql', ['-h', host, '-p', port, '-U', user, '-d', database, '-c', `DO $migration$
DECLARE item record;
BEGIN
  FOR item IN SELECT c.conrelid::regclass AS table_name, c.conname FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid WHERE c.connamespace = 'public'::regnamespace AND t.relname LIKE 'pde_runtime_%' AND c.contype = 'p' LOOP
    EXECUTE format('ALTER TABLE %s RENAME CONSTRAINT %I TO %I', item.table_name, item.conname, item.conname || '__source');
  END LOOP;
  FOR item IN SELECT i.indexrelid::regclass AS index_name, ic.relname AS index_text FROM pg_index i JOIN pg_class t ON t.oid = i.indrelid JOIN pg_class ic ON ic.oid = i.indexrelid WHERE t.relname LIKE 'pde_runtime_%' AND ic.relname LIKE 'pde_runtime_%' LOOP
    EXECUTE format('ALTER INDEX %s RENAME TO %I', item.index_name, item.index_text || '__source');
  END LOOP;
END $migration$;`], {cwd: root, env});

console.log('Local database prepared from the production dump.');
