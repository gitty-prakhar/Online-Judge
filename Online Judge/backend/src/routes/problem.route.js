import { Router } from "express";
import { verifyJWT,verifyAdmin } from "../middlewares/auth.middleware.js";
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
router.route("/").post(verifyJWT,verifyAdmin,createProblem);
router.route("/:id").put(verifyJWT,verifyAdmin,updateProblem);
router.route("/:id").delete(verifyJWT,verifyAdmin,deleteProblem);

export default router;
