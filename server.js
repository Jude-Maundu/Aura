import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import userRoutes from "./routes/user.routes.js";
import { fileURLToPath } from "url";

// --- IMPORT AURAGUARD ROUTES ---
import auraguardRoutes from "./routes/routes.js";

// Resolve file paths (same as your example)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables
dotenv.config();

// Initialize Express app
const app = express();

// Enable CORS (same style as your blog API)
app.use(cors({ origin: "http://localhost:3001", credentials: true }));

// Allow JSON payloads (same as your blog server)
app.use(express.json({ limit: "10mb" }));

// Public "uploads" folder (optional, but I kept it because your server uses it)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/test", (req, res) => {
  res.send("<h1>AuraGuard Test Route Loaded...</h1>");
});

// ===============================
//        AURAGUARD ROUTES
// ===============================
app.use("/api/auraguard", auraguardRoutes);
// ===============================
//        USER ROUTES
// ===============================
app.use("/api/users", userRoutes);

// ===============================
//     HANDLE UNKNOWN ROUTES
// ===============================  


// Handle unknown routes
app.use((req, res) => {
  res.status(404).send("<h1>Route Not Found</h1>");
});

// Show DB URI (same as your example)
console.log(process.env.MONGO_URI);

// MongoDB Connection
const db = process.env.MONGO_URI;

async function dbconnection() {
  try {
    await mongoose.connect(db);
    console.log("Connected to MongoDB");

    // Start server
    app.listen(4000, () => {
      console.log("Server running at http://localhost:4000");
    });

  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
}

dbconnection();
