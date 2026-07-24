import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserProfile, updateProfile } from "../controllers/profile.controller.js";

const router = Router();

// Public route to view any user's profile by username
router.route("/:username").get(getUserProfile);

// Protected route to update your own profile
router.route("/update").put(verifyJWT, updateProfile);

export default router;
