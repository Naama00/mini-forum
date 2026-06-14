# Mini-Forum Project 💬

A modern, full-stack, and responsive Mini-Forum application designed for managing discussions, posts, and user interactions. Built with a robust **Node.js/Express** backend and a dynamic **React** frontend, following clean architecture principles, secure authentication, and scalable database separation.

---

## 🚀 Features

### 👤 User Management & Security
* **Authentication & Authorization:** Secure registration and login using **JWT (JSON Web Tokens)** and HTTP-Only cookies/headers.
* **Role-Based Access Control (RBAC):** Distinction between standard users and Administrators (Admins have special privileges such as post deletion).
* **Data Protection:** Password hashing using `bcrypt` and input sanitation to prevent XSS and SQL Injection/NoSQL Injection.

### 📝 Forum Engine
* **Threads & Posts:** Create, read, update, and delete (CRUD) forum discussion threads.
* **Interactive Comments:** Users can reply to existing posts, facilitating multi-threaded community engagement.
* **Ownership Guardrails:** Strict server-side checks ensure users can only modify or delete *their own* posts or comments.

### 💻 User Experience (UI/UX)
* **Responsive Design:** Fully optimized for Mobile, Tablet, and Desktop screens.
* **Dynamic UI Feedback:** Informative loading indicators, success/error toast alerts, and smooth client-side routing using `React Router`.

---

## 🛠 Tech Stack

**Frontend:**
* React (Functional Components & Hooks)
* React Router DOM (Client-side Routing)
* State Management: React Context API / Redux (Optional)
* Styling: CSS Modules / Tailwind CSS / Material-UI

**Backend:**
* Node.js & Express.js (RESTful API Architecture)
* Database: MongoDB with Mongoose ORM *[or PostgreSQL/MySQL with Sequelize - change as needed]*
* Security: JWT, bcrypt, cors, helmet

---

## 📂 Project Structure

The project maintains a strict **Separation of Concerns (SoC)** to ensure long-term maintenance and clear layer boundaries.

```text
mini-forum/
├── backend/
│   ├── config/             # DB connection, environment variables setup
│   ├── controllers/        # Express route handlers (Request validation & HTTP responses)
│   ├── models/             # Database Schemas (User, Post, Comment)
│   ├── routes/             # API Endpoint routing definitions
│   ├── services/           # Core business logic layer (Isolated calculations/operations)
│   ├── middlewares/        # Authentication, Error handling, and Role validation
│   └── server.js           # App entry point
│
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Button, Card, Spinner)
│   │   ├── context/        # Auth and global state contexts
│   │   ├── pages/          # Page view components (Home, Login, Register, ThreadDetails)
│   │   ├── services/       # API abstraction layer (Axios fetch configurations)
│   │   ├── App.jsx         # Root component & Routing configuration
│   │   └── main.jsx        # App entry point
└── README.md
🏁 Getting Started
Follow these instructions to set up and run the project locally.

Prerequisites
Node.js installed (v16.x or higher recommended)

MongoDB account/local community instance (or SQL alternative)

1. Clone the Repository
Bash
git clone [https://github.com/your-username/mini-forum.git](https://github.com/your-username/mini-forum.git)
cd mini-forum
2. Backend Setup
Navigate to the backend directory:

Bash
cd backend
Install dependencies:

Bash
npm install
Create a .env file in the root of the backend folder and populate it with your environment configurations:

קטע קוד
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
Start the backend server:

Bash
# Production / standard start
npm start

# Development mode (with nodemon auto-restart)
npm run dev
The server will start running on http://localhost:5000.

3. Frontend Setup
Open a new terminal window and navigate to the frontend directory:

Bash
cd frontend
Install dependencies:

Bash
npm install
Start the Vite/React development server:

Bash
npm run dev
The frontend application will boot up, usually accessible at http://localhost:5173 or http://localhost:3000.

🔌 API Endpoints (Core)
Method	Endpoint	Description	Auth Required
POST	/api/auth/register	Register a new user account	❌ No
POST	/api/auth/login	Log in and receive JWT	❌ No
GET	/api/posts	Fetch all forum posts	❌ No
GET	/api/posts/:id	Fetch details of a single post + comments	❌ No
POST	/api/posts	Create a new discussion thread	🔒 Yes (User)
DELETE	/api/posts/:id	Delete a post	🔒 Yes (Author/Admin)
POST	/api/posts/:id/comments	Add a comment to a specific post	🔒 Yes (User)
🛡️ Error Handling & Clean Code Standards
Global Error Handling: Implemented a centralized Express Error Middleware that gracefully catches runtime errors and responds with standard JSON payloads, preventing raw server stack traces from being exposed.

DRY Principle: Core functionalities are broken down into services to avoid duplication across multiple controllers.

Git Hygiene: The project strictly ignores build files, dependency catalogs (node_modules), and secrets using an optimized .gitignore configuration.


