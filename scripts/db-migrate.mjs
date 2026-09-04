// @ts-check

/** Run the reviewed TeqFW DEM migration against the configured database. */

import {execFile} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const env = {...process.env, PGPASSWORD: process.env.TEQFW_DB__PASSWORD};
await run('psql', [
    '-h', process.env.TEQFW_DB__HOST, '-p', process.env.TEQFW_DB__PORT,
    '-U', process.env.TEQFW_DB__USER, '-d', process.env.TEQFW_DB__DATABASE,
    '-v', 'ON_ERROR_STOP=1', '-c', `DO $migration$
DECLARE item record;
BEGIN
  FOR item IN SELECT c.conrelid::regclass AS table_name, c.conname FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid WHERE c.connamespace = 'public'::regnamespace AND t.relname LIKE 'pde_runtime_%' AND c.contype = 'p' AND NOT EXISTS (SELECT 1 FROM pg_class x WHERE x.relname = t.relname || '__backup_dem_v3') LOOP
    EXECUTE format('ALTER TABLE %s RENAME CONSTRAINT %I TO %I', item.table_name, item.conname, item.conname || '__source');
  END LOOP;
  FOR item IN SELECT i.indexrelid::regclass AS index_name, ic.relname AS index_text FROM pg_index i JOIN pg_class t ON t.oid = i.indrelid JOIN pg_class ic ON ic.oid = i.indexrelid WHERE t.relname LIKE 'pde_runtime_%' AND ic.relname LIKE 'pde_runtime_%' AND NOT EXISTS (SELECT 1 FROM pg_class x WHERE x.relname = t.relname || '__backup_dem_v3') LOOP
    EXECUTE format('ALTER INDEX %s RENAME TO %I', item.index_name, item.index_text || '__source');
  END LOOP;
END $migration$;`,
], {cwd: root, env});
const result = await run(path.join(root, 'node_modules', '.bin', 'teq'), ['db:migrate'], {cwd: root, env});
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);

const backups = [
    'pde_runtime_access_client__backup_dem_v3',
    'pde_runtime_access_token__backup_dem_v3',
    'pde_runtime_audit_event__backup_dem_v3',
    'pde_runtime_delegation__backup_dem_v3',
    'pde_runtime_delegation_revision__backup_dem_v3',
    'pde_runtime_oauth_client__backup_dem_v3',
    'pde_runtime_owner_session__backup_dem_v3',
];
await run('psql', [
    '-h', process.env.TEQFW_DB__HOST,
    '-p', process.env.TEQFW_DB__PORT,
    '-U', process.env.TEQFW_DB__USER,
    '-d', process.env.TEQFW_DB__DATABASE,
    '-v', 'ON_ERROR_STOP=1',
    '-c', backups.map((name) => `DROP TABLE IF EXISTS public."${name}";`).join(' '),
], {cwd: root, env});
console.log(`Removed ${backups.length} migration source backup tables.`);
