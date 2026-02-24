import express from "express";
import cors from "cors";
import 'dotenv/config';
import { db } from "./db.js";

import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import subscriptionPlanRoutes from "./routes/subscriptionPlan.route.js";
import subscriptionRoutes from "./routes/subscription.route.js";
import invoiceRoutes from "./routes/invoice.route.js";
import paymentRoutes from "./routes/payment.route.js";
import foodRoutes from "./routes/food.route.js";
import recipeRoutes from "./routes/recipe.route.js";
import recipeIngredientRoutes from "./routes/recipeIngredient.route.js";
import foodDiaryRoutes from "./routes/foodDiary.route.js";
import activityTypeRoutes from "./routes/activityType.route.js";
import exerciseRoutes from "./routes/exercise.route.js";
import workoutSessionRoutes from "./routes/workoutSession.route.js";
import sessionDetailRoutes from "./routes/sessionDetail.route.js";
import progressTrackerRoutes from "./routes/progressTracker.route.js";
import userMetricsRoutes from "./routes/userMetrics.route.js";
import dietRecommendationRoutes from "./routes/dietRecommendation.route.js";
import dataSourceRoutes from "./routes/dataSource.route.js";
import etlExecutionRoutes from "./routes/etlExecution.route.js";
import dataQualityCheckRoutes from "./routes/dataQualityCheck.route.js";
import dataAnomalyRoutes from "./routes/dataAnomaly.route.js";
import healthGoalRoutes from "./routes/healthGoal.route.js";
import userProfileRoutes from "./routes/userProfile.route.js";

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
app.use("/subscription-plans", subscriptionPlanRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/payments", paymentRoutes);
app.use("/foods", foodRoutes);
app.use("/recipes", recipeRoutes);
app.use("/recipe-ingredients", recipeIngredientRoutes);
app.use("/food-diary", foodDiaryRoutes);
app.use("/activity-types", activityTypeRoutes);
app.use("/exercises", exerciseRoutes);
app.use("/workouts", workoutSessionRoutes);
app.use("/session-details", sessionDetailRoutes);
app.use("/progress", progressTrackerRoutes);
app.use("/user-metrics", userMetricsRoutes);
app.use("/diet-recommendations", dietRecommendationRoutes);
app.use("/data-sources", dataSourceRoutes);
app.use("/etl-executions", etlExecutionRoutes);
app.use("/data-quality-checks", dataQualityCheckRoutes);
app.use("/data-anomalies", dataAnomalyRoutes);
app.use("/health-goals", healthGoalRoutes);
app.use("/user-profiles", userProfileRoutes);

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Erreur serveur interne"
  });
});

export default app;
