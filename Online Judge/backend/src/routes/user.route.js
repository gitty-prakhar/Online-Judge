import {Router} from "express";
import { sendRegistrationOtp, logoutUser, registerUser,loginUser, refreshAccessToken,getCurrentUser, changeCurrentPassword, forgotPassword, resetPassword } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/send-registration-otp").post(sendRegistrationOtp);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT,logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/current-user").get(verifyJWT,getCurrentUser);

router.route("/change-password").post(verifyJWT,changeCurrentPassword);

router.route("/forgot-password").post(forgotPassword);

router.route("/reset-password").post(resetPassword);


export default router;