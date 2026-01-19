import express from "express";
import cors from "cors";
import 'dotenv/config';
import db from "./db.js";

import userRoutes from "./routes/user.route.js";

const app = express();

app.use(cors({
  //origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());

// Routes availables
app.use("/user", userRoutes);

export default app;
