// @ts-check

/** Run the reviewed TeqFW DEM migration against the configured database. */

import {execFile} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const env = {...process.env, PGPASSWORD: process.env.TEQFW_DB__PASSWORD};
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
