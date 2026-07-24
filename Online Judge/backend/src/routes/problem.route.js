import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    createProblem, 
    getAllProblems, 
    getProblemBySlug, 
    updateProblem, 
    deleteProblem 
} from "../controllers/problem.controller.js";

const router = Router();

// Public routes
router.route("/").get(getAllProblems);
router.route("/:slug").get(getProblemBySlug);

// Protected routes
router.route("/").post(verifyJWT, createProblem);
router.route("/:id").put(verifyJWT, updateProblem);
router.route("/:id").delete(verifyJWT, deleteProblem);

export default router;
