import app from "./app.js";

const port = process.env.PORT || 3000;

import swaggerUi from 'swagger-ui-express'; 
import swaggerFile from './swagger-output.json' with { type: 'json' };

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`App listening on port ${port}`);
});

// Garde le serveur actif et gère les erreurs
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
