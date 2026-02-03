import app from "./app.js";

const port = process.env.PORT || 3000;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`App listening on port ${port}`);
});

// Garde le serveur actif et gère les erreurs
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
