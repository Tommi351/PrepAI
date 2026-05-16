import express from "express";
import { fileUpload } from "../controllers/upload.controller.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";
const router = express.Router();
router.post("/", uploadMiddleware, fileUpload);
export default router;
//# sourceMappingURL=upload.route.js.map