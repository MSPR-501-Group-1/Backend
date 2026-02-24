import express from "express";
import * as controller from "../controllers/invoice.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { invoiceSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getInvoices);
router.post("/", authorize("ADMIN"), validate(invoiceSchema), controller.createInvoice);
router.get("/:id", authorize("ADMIN"), controller.getInvoiceById);
router.put("/:id", authorize("ADMIN"), validate(invoiceSchema), controller.updateInvoice);
router.delete("/:id", authorize("ADMIN"), controller.deleteInvoice);

export default router;
