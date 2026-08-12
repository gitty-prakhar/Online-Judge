import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    createTestCase, 
    getTestCases, 
    updateTestCase, 
    deleteTestCase 
} from "../controllers/testCase.controller.js";

const router=Router();

// Protected routes for managing test cases
router.route("/problem/:problemId").get(verifyJWT,getTestCases);
router.route("/").post(verifyJWT,createTestCase);
router.route("/:id").put(verifyJWT,updateTestCase);
router.route("/:id").delete(verifyJWT,deleteTestCase);

export default router;
