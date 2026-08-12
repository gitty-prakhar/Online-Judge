import { Router } from "express";
import { verifyJWT,verifyAdmin } from "../middlewares/auth.middleware.js";
import { createContest, getAllContests, getContestById, registerForContest } from "../controllers/contest.controller.js";

const router=Router();

router.route("/").get(getAllContests);
router.route("/:id").get(getContestById);
router.route("/").post(verifyJWT,verifyAdmin,createContest);
router.route("/:id/register").post(verifyJWT,registerForContest);

export default router;
