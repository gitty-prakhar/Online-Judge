import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./docs/swagger.js";
import cookieParser from "cookie-parser";

const app=express();

// Security Middlewares
app.use(helmet());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later"
});
app.use("/api", limiter);

// Add these middlewares before your routes!
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//routes
import userRouter from "./routes/user.route.js";
import problemRouter from "./routes/problem.route.js";
import testCaseRouter from "./routes/testCase.route.js";
import submissionRouter from "./routes/submission.route.js";
import profileRouter from "./routes/profile.route.js";
import leaderboardRouter from "./routes/leaderboard.route.js";
import contestRouter from "./routes/contest.route.js";


app.use("/api/v1/users",userRouter);
app.use("/api/v1/problems",problemRouter);
app.use("/api/v1/testcases",testCaseRouter);
app.use("/api/v1/submissions",submissionRouter);
app.use("/api/v1/profile",profileRouter);
app.use("/api/v1/leaderboard",leaderboardRouter);
app.use("/api/v1/contests",contestRouter);


export {app};