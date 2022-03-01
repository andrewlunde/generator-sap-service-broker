# <%= app_name %> Application

Welcome to the <%= app_name %> project.

It contains these folders and files, following the CAP recommended project layout:

File / Folder | Purpose
---------|----------
`README.md` | this getting started guide
`app/` | content for UI frontends go here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`mta.yaml` | project structure and relationships
`package.json` | project metadata and configuration
`.cdsrc.json` | hidden project configuration
`xs-security` | security profile configuration


## Next Steps...

- Open a new terminal and run  `cds watch`
- ( in VSCode simply choose _**Terminal** > Run Task > cds watch_ )
- Start adding content, e.g. a [db/schema.cds](db/schema.cds), ...


## Learn more...

Learn more at https://cap.cloud.sap/docs/get-started/

# Build Command:
```
cd <%= project_name %> ; mkdir -p mta_archives ; mbt build -p=cf -t=mta_archives --mtar=<%= app_name %>.mtar
```

# Deploy Command:
```
cf deploy mta_archives/<%= app_name %>.mtar -f
```

# Subsequent Build+Deploy Commands:
```
mbt build -p=cf -t=mta_archives --mtar=<%= app_name %>.mtar ; cf deploy mta_archives/<%= app_name %>.mtar -f
```

# Undeploy Command:
```
cf undeploy <%= app_name %> -f --delete-services
```
