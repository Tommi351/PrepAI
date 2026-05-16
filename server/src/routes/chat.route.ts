import express from "express";
import { chatWithDocuments } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", chatWithDocuments);

export default router;
