import express from "express";
import { getMe, loginUser, logOutUser, registerUser } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logOutUser);
router.get("/getme", protect, getMe);

export default router;
