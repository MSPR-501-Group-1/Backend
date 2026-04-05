import express from "express";
import cors from "cors";
import 'dotenv/config';

import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import userProfileRoutes from "./routes/userProfile.route.js";
import systemRoutes from "./routes/system.route.js";
import userMetricsRoutes from "./routes/userMetrics.route.js";
import analyticsRoutes, { partnersRouter } from "./routes/analytics.route.js";

const app = express();

app.use(cors({
  //origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());

// Health check route pour docker et monitoring
app.use("/", systemRoutes);

// Routes publiques d'authentification
app.use("/auth", authRoutes);

// Routes protégées
app.use("/users", userRoutes);
app.use("/user-profiles", userProfileRoutes);
app.use("/metrics", userMetricsRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/partners", partnersRouter);

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Erreur serveur interne"
  });
});

export default app;
