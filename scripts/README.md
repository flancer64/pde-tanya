# Database migration

Production migration only:

```sh
node --env-file=.env scripts/db-migrate.mjs
```


Local preparation and migration test:

```sh
node --env-file=.env scripts/db-prepare-local.mjs
node --env-file=.env scripts/db-migrate.mjs
```

`db-prepare-local.mjs` replaces the local `public` schema from `tmp/pde_tanya-prod.dump`.
`db-migrate.mjs` performs only the reviewed migration and retains source tables as
`<table>__backup_dem_v3`.
