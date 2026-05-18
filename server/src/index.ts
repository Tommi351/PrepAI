import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import healthRoute from "./routes/helloWorld.js";
import uploadRoute from "./routes/upload.route.js";
import chatRoute from "./routes/chat.route.js";
import documentRoute from "./routes/document.route.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://prepai-3x0fji89s-tomis-projects-ea66ced6.vercel.app",
    ], // 👈 allow your frontend to talk to backend
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Hello World with Typescript");
});

// Routes
app.use("/api/health", healthRoute);

app.use("/upload", uploadRoute);

app.use("/chat", chatRoute);

app.use("/documents", documentRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
