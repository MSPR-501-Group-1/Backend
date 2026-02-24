import express from "express";
import * as controller from "../controllers/payment.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { paymentTransactionSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getPayments);
router.post("/", authorize("ADMIN"), validate(paymentTransactionSchema), controller.createPayment);
router.get("/:id", authorize("ADMIN"), controller.getPaymentById);
router.put("/:id", authorize("ADMIN"), validate(paymentTransactionSchema), controller.updatePayment);
router.delete("/:id", authorize("ADMIN"), controller.deletePayment);

export default router;
