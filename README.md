# Backend

1. Pour lancer le backend :
```
npm start
```
2. Pour lancer le mock de la bdd (via docker ):

```
docker run --name postgres-test -e POSTGRES_PASSWO
RD=postgres -e POSTGRES_DB=testdb -p 5432:5432 -d postgres:15
```