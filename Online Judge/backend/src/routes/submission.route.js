import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createSubmission, getSubmissionById } from "../controllers/submission.controller.js";

const router = Router();

// Both of these should be protected, as only logged-in users can submit code
router.route("/").post(verifyJWT, createSubmission);
router.route("/:id").get(verifyJWT, getSubmissionById);

export default router;
