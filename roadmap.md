# 🚀 Online Judge Backend Roadmap (Node.js + Express + MongoDB)

> A production-oriented roadmap for building an Online Judge backend similar to Codeforces, LeetCode, or HackerRank.

---

# 📌 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB + Mongoose
* **Authentication:** JWT + HTTP-only Cookies
* **Password Hashing:** bcrypt
* **Queue:** BullMQ
* **Redis:** Queue & Caching
* **Sandbox:** Docker
* **Logging:** Winston / Pino
* **Validation:** Zod / express-validator
* **API Documentation:** Swagger (OpenAPI)

---

# 📂 Recommended Folder Structure

```text
src/
│
├── config/
├── controllers/
├── services/
├── repositories/          # Optional
├── routes/
├── middlewares/
├── validators/
├── models/
├── utils/
├── constants/
├── queues/
├── workers/
├── docker/
├── logs/
├── docs/
├── app.js
└── server.js
```

---

# ✅ Phase 1 — Project Initialization

## Tasks

* Initialize project
* Configure Express
* Install dependencies
* Configure environment variables
* Configure CORS
* Configure Cookie Parser
* Configure JSON parser

### Dependencies

```bash
npm init -y

npm install express mongoose dotenv cors

npm install bcrypt jsonwebtoken cookie-parser

npm install bullmq ioredis

npm install helmet morgan

npm install express-rate-limit

npm install zod
```

---

# ✅ Phase 2 — Database Setup

## Tasks

* Create MongoDB Atlas Cluster
* Connect using Mongoose
* Create configuration file
* Test connection

---

# ✅ Phase 3 — Database Models

## User

* username
* email
* password
* role
* refreshToken
* timestamps

---

## Profile

* bio
* github
* linkedin
* country
* organization
* avatar
* solvedProblems
* attemptedProblems

---

## Problem

* title
* slug
* statement
* difficulty
* tags
* constraints
* input format
* output format
* examples
* notes
* time limit
* memory limit
* author
* visibility

---

## TestCase

* problemId
* input
* expectedOutput
* isHidden

---

## Submission

* userId
* problemId
* language
* code
* verdict
* executionTime
* memoryUsed
* compileOutput
* runtimeError
* createdAt

---

## Contest (Later)

* title
* startTime
* endTime
* problems
* participants

---

# ✅ Phase 4 — Authentication

## Register

* Validate input
* Check existing user
* Hash password
* Save user
* Generate JWT
* Generate Refresh Token
* Set HTTP-only cookie

---

## Login

* Verify email
* Compare password
* Generate JWT
* Generate Refresh Token
* Set cookies

---

## Logout

* Clear cookies
* Remove refresh token

---

## Protected Routes

Middleware should

* Read cookie
* Verify JWT
* Find user
* Attach `req.user`

---

## Role Based Authorization

Example

* User
* Admin
* Problem Setter

---

# ✅ Phase 5 — Validation

Validate

* Registration
* Login
* Problem creation
* Submission
* Contest creation

Never trust client input.

---

# ✅ Phase 6 — Error Handling

Create

* ApiError
* ApiResponse
* asyncHandler

Centralized error middleware.

---

# ✅ Phase 7 — Logging

Log

* Incoming requests
* Errors
* Queue events
* Worker events
* Docker execution

---

# ✅ Phase 8 — Problem APIs

## Admin

* Create Problem
* Update Problem
* Delete Problem

## User

* Get All Problems
* Get Single Problem
* Search Problems
* Filter Problems
* Pagination

---

# ✅ Phase 9 — Test Case Management

Support

## Sample Test Cases

Visible to everyone

## Hidden Test Cases

Only judge can access

---

# ✅ Phase 10 — Submission API

Flow

```text
Receive Submission

↓

Store in MongoDB

↓

Status = Pending

↓

Push Job to BullMQ

↓

Return Submission ID
```

---

# ✅ Phase 11 — Queue System

BullMQ

Redis

Job Queue

Features

* Retry
* Failed Jobs
* Delayed Jobs
* Dead Letter Queue

---

# ✅ Phase 12 — Worker

Worker should

```text
Receive Job

↓

Fetch Submission

↓

Fetch Problem

↓

Status = Judging

↓

Compile Code

↓

Run Test Cases

↓

Generate Verdict

↓

Update Submission
```

---

# ✅ Phase 13 — Docker Sandbox

Run code securely

Restrict

* CPU
* RAM
* Process Count
* Network Access
* File System Access

Prevent malicious code execution.

---

# ✅ Phase 14 — Multi-language Support

Support

* C++
* Python
* Java
* JavaScript

Each language should have

* Compile command
* Execute command
* Docker image

---

# ✅ Phase 15 — User Profile

Display

* Solved Problems
* Attempted Problems
* Total Submissions
* Accepted Count
* Languages Used
* Rating (Future)

---

# ✅ Phase 16 — Leaderboard

Implement

* Global Leaderboard
* Most Solved
* Weekly
* Monthly

---

# ✅ Phase 17 — Contest System

Features

* Create Contest
* Register Contest
* Join Contest
* Contest Problems
* Standings
* Frozen Rankings
* Virtual Contest

---

# ✅ Phase 18 — Search & Filters

Support

* Search by title
* Difficulty
* Tags
* Sorting
* Pagination

---

# ✅ Phase 19 — Security

Implement

* Helmet
* Rate Limiting
* JWT Expiry
* HTTP-only Cookies
* Secure Cookies
* Password Hashing
* Input Validation
* CORS

---

# ✅ Phase 20 — Performance

Database Indexes

* email
* username
* slug
* problemId
* submissionId
* verdict

Redis Cache

* Problem List
* Leaderboard
* Popular Problems

---

# ✅ Phase 21 — Real-time Updates

Option 1

* Poll submission endpoint every 2 seconds

Option 2 (Recommended)

* Server-Sent Events (SSE)

Option 3

* Socket.io

---

# ✅ Phase 22 — API Documentation

Document

* Authentication
* Problems
* Submissions
* Users
* Contests

Use Swagger/OpenAPI.

---

# ✅ Phase 23 — Testing

Write tests for

* Authentication
* Middleware
* Problems API
* Submission API
* Worker
* Docker Execution

---

# ✅ Phase 24 — Deployment

Deploy

* Backend
* Redis
* MongoDB Atlas
* Docker Worker

Reverse Proxy

* NGINX

---

# 📌 Final Development Order

```
✅ Project Setup

↓

✅ Database

↓

✅ Models

↓

✅ Authentication

↓

✅ Authorization

↓

✅ Validation

↓

✅ Error Handling

↓

✅ Logging

↓

✅ Problem CRUD

↓

✅ Test Case Management

↓

✅ Submission API

↓

✅ BullMQ Queue

↓

✅ Worker

↓

✅ Docker Sandbox

↓

✅ Multi-language Support

↓

✅ User Profile

↓

✅ Leaderboard

↓

✅ Contest System

↓

✅ Real-time Updates

↓

✅ Testing

↓

✅ Deployment
```

---

# 🎯 Stretch Goals

* Code plagiarism detection
* AI-generated hints
* Editorial system
* Discussion forum
* Problem bookmarking
* User ratings (Codeforces-style)
* Contest rating calculation
* Email verification
* Password reset
* Admin dashboard
* Analytics dashboard
* Submission replay
* Dark mode support (frontend)
* GitHub OAuth login
* Google OAuth login

---

# 🎓 Learning Goals

By completing this project, you will gain experience with:

* Express.js
* MongoDB & Mongoose
* JWT Authentication
* HTTP-only Cookies
* Redis
* BullMQ
* Docker
* Background Workers
* Secure Code Execution
* REST API Design
* Backend Architecture
* Logging & Monitoring
* Production Security
* API Documentation
* Deployment
* Scalable Backend Development

This project closely resembles the architecture used by real-world online judges and is an excellent full-stack backend project for a software engineering portfolio.
