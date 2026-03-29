# Backend

## Lancement local

1. Installer les dependances:

```
npm install
```

2. Demarrer le backend:

```
npm start
```

## Variables d'environnement base de donnees

Le backend accepte desormais les variables DB_* avec fallback POSTGRES_* (et fallback final sur variables standards PG*):

- DB_HOST -> POSTGRES_HOST -> PGHOST -> localhost
- DB_PORT -> POSTGRES_PORT -> PGPORT -> 5432
- DB_NAME -> POSTGRES_DB -> PGDATABASE
- DB_USER -> POSTGRES_USER -> PGUSER
- DB_PASSWORD -> POSTGRES_PASSWORD -> PGPASSWORD

Ce mapping est compatible avec le docker compose racine qui fournit DB_HOST, DB_PORT, DB_NAME, DB_USER et DB_PASSWORD.

## Verification rapide

Une fois le service demarre:

```
GET /health
```

La reponse doit inclure data.database = "up".