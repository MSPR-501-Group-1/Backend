import express from "express";
import * as controller from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", controller.getUsers);
router.get("/:id", controller.getUserById);

router.post("/", controller.createUser);

router.put("/:id", controller.updateUser);

router.delete("/:id", controller.deleteUser);

export default router;
