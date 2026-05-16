import express from "express";
import { fetchDocuments } from "../controllers/document.controller.js";

const router = express.Router();

router.get("/", fetchDocuments);

export default router;
