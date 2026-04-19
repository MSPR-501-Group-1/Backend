# Backend

API Node.js/Express utilisee par le frontend et les integrations ETL.

## Prerequis

- Node.js 20+
- npm
- PostgreSQL local, ou Docker Compose (recommande)

## Lancement local

1. Installer les dependances.
2. Demarrer le backend.

```bash
npm install
npm start
```

Le service ecoute sur le port 3000 par defaut.

## Lancement avec Docker (depuis la racine)

```bash
docker compose up --build db backend
```

## Variables d'environnement base de donnees

Le backend accepte les variables DB_* avec fallback POSTGRES_* (puis fallback final sur variables PG*):

- DB_HOST -> POSTGRES_HOST -> PGHOST -> localhost
- DB_PORT -> POSTGRES_PORT -> PGPORT -> 5432
- DB_NAME -> POSTGRES_DB -> PGDATABASE
- DB_USER -> POSTGRES_USER -> PGUSER
- DB_PASSWORD -> POSTGRES_PASSWORD -> PGPASSWORD

Le docker compose racine fournit actuellement les variables POSTGRES_* au service backend.

## Verification rapide

Une fois le service demarre:

```http
GET /health
```

La reponse doit inclure data.database = "up".