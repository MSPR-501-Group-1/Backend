import express from "express";
import cors from "cors";
import 'dotenv/config';
import { db } from "./db.js";

import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";

const app = express();

app.use(cors({
  //origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());

// Routes publiques d'authentification
app.use("/auth", authRoutes);

// Routes protégées
app.use("/users", userRoutes);

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Erreur serveur interne"
  });
});

export default app;
