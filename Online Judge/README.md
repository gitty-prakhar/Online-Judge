# ⚡ CodeJudge - Full-Stack Online Judge Platform

A robust, scalable, and fully-featured Online Judge platform built with the MERN stack (MongoDB, Express, React, Node.js). It supports secure user authentication, real-time code execution in isolated Docker containers, problem creation, contests, and a competitive leaderboard system.

---

## 🌟 Key Features

### 🧑‍💻 User Experience
- **Secure Authentication:** JWT-based authentication with 2-step Email OTP verification using Nodemailer. Supports "Forgot Password" flows and generic identifiers (Username/Email).
- **Code Execution:** Write and submit code directly from the browser. The code is executed in an isolated, secure Docker environment to prevent malicious attacks.
- **Leaderboards & Profiles:** Track solved problems, view submission history, and compete globally on the leaderboard.
- **Contests:** Participate in timed programming contests featuring a curated list of problems.

### 🛡️ Admin & Setter Features
- **Admin Roles:** Secure admin authorization using a secret registration code.
- **Problem Management:** Full GUI to create and manage coding problems, test cases, time limits, and memory limits.
- **Contest Management:** Create and schedule live contests with multiple selected problems.

### ⚙️ System Architecture
- **Asynchronous Processing:** Code submissions are offloaded to a background queue using **Redis** and **BullMQ**.
- **Judge Worker:** A standalone background worker processes queued submissions, runs them in a Docker sandbox, and evaluates the output against hidden test cases.
- **Cloud Database:** Seamlessly integrates with MongoDB Atlas for persistent storage of users, problems, and submissions.

---

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite):** Lightning-fast frontend tooling.
- **React Router DOM:** For seamless single-page application navigation.
- **Axios:** For handling API requests.
- **Vanilla CSS:** Custom-built, responsive, and aesthetically premium design system.

### Backend
- **Node.js & Express.js:** Robust RESTful API architecture.
- **MongoDB (Mongoose):** Data modeling and cloud storage.
- **BullMQ & Redis:** High-performance message queue for background job processing.
- **Docker:** Strict sandbox environment (`exec` commands) to safely run user-submitted code.
- **Nodemailer:** Handles all OTP and automated email communications.
- **JWT & Bcrypt:** Secure token generation and password hashing.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) (Must be running in the background for code execution)
- [Redis](https://redis.io/) (Must be running on port `6379`)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Account (or local MongoDB server)

### 2. Installation & Setup

#### Clone the Repository
```bash
git clone <repository-url>
cd "Online Judge"
```

#### Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=8000
MONGODB_URL=mongodb+srv://<your-username>:<your-password>@<your-cluster-url>
ACCESS_TOKEN_SECRET=your_super_secret_access_token
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=http://localhost:5173
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
ADMIN_SECRET=CodeJudgeAdmin2026
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password
```

#### Setup Frontend
```bash
cd ../frontend
npm install
```

### 3. Running the Application

You will need to open **three separate terminal windows** to run the complete system.

**Terminal 1: Start the Backend Server**
```bash
cd backend
npm run dev
```

**Terminal 2: Start the Judge Worker**
*(Make sure Redis and Docker are actively running on your machine)*
```bash
cd backend
node src/workers/judgeWorker.js
```

**Terminal 3: Start the Frontend React App**
```bash
cd frontend
npm run dev
```

The application will now be accessible at `http://localhost:5173`.

---

## 🔒 Becoming an Admin

By default, all registered users are standard users. To access the "Create Problem" and "Create Contest" features:
1. Go to the **Register** page.
2. Fill out your details.
3. In the **Admin Registration Code** field, enter the `ADMIN_SECRET` defined in your backend `.env` file (e.g., `CodeJudgeAdmin2026`).
4. Complete the OTP verification. 
5. Log in, and you will now see the Admin features in the navigation bar!

---

## 📝 Folder Structure

```text
Online Judge/
├── backend/
│   ├── src/
│   │   ├── controllers/      # API logic (auth, problems, contests, submissions)
│   │   ├── db/               # Database connection setup
│   │   ├── docker/           # Sandbox code execution scripts
│   │   ├── middlewares/      # JWT verification, Error handling
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express router definitions
│   │   ├── utils/            # Async handlers, API responses, Nodemailer
│   │   └── workers/          # BullMQ Judge Worker script
│   ├── index.js              # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI (Navbar, etc.)
    │   ├── pages/            # Views (Login, Register, Problems, Leaderboard, etc.)
    │   ├── api.js            # Axios configuration
    │   ├── App.jsx           # React Router setup
    │   └── index.css         # Global design system
    ├── index.html
    └── package.json
```

---

## ⚠️ Security Notes
- The Docker environment is utilized to prevent arbitrary command execution (RCE) on the host machine.
- User passwords are cryptographically hashed using `bcrypt` before storage.
- Session management is handled securely via `httpOnly` cookies to mitigate XSS attacks.
