import express from "express";
import * as controller from "../controllers/userProfile.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { userProfileSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getUserProfiles);
router.post("/", authorize("ADMIN"), validate(userProfileSchema), controller.createUserProfile);
router.get("/:id", authorize("ADMIN"), controller.getUserProfileById);
router.put("/:id", authorize("ADMIN"), validate(userProfileSchema), controller.updateUserProfile);
router.delete("/:id", authorize("ADMIN"), controller.deleteUserProfile);

export default router;
