const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: { title: 'Mon API', description: 'Documentation automatique' },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';

const routes = ['./app.js']; // ou './routes/*.route.js' ???

swaggerAutogen(outputFile, routes, doc);