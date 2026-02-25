const swaggerAutogen = require('swagger-autogen')();
const fs = require('fs');
const path = require('path');

const doc = {
  info: { title: 'Mon API', description: 'Documentation automatique' },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';

const routesPath = './app/routes';
const routes = fs.readdirSync(routesPath).map(file => path.join(routesPath, file));

swaggerAutogen(outputFile, routes, doc);