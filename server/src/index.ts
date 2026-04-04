import express from "express";
import cors from "cors";
import healthRoute from "./routes/helloWorld.js";
import { configDotenv } from "../node_modules/dotenv/lib/main.js";

configDotenv();
const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Hello World with Typescript");
});

// Routes
app.use("/api/health", healthRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
