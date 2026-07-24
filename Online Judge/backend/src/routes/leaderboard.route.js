import { Router } from "express";
import { getGlobalLeaderboard } from "../controllers/leaderboard.controller.js";
const router = Router();
router.route("/global").get(getGlobalLeaderboard);
export default router;
