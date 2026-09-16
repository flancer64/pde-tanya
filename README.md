# pde-tanya

Personal Digital Embassy for Tanya

## Database migration

Run the explicit Runtime DEM migration while the application is stopped and
after taking an independent PostgreSQL backup:

```sh
npm exec -- teq db:migrate
```

The command recognizes the supported Runtime predecessors, rebuilds the
current DEM through TeqFW, records schema history, verifies the result, and
removes source backups only after successful verification.
