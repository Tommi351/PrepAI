import multer from "multer";
import path from "path";
// Memory storage (file will be in req.file.buffer)
const storage = multer.memoryStorage();
// Create the multer instance
const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB in bytes
        files: 5, // Limits number of files per request
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = [".pdf", ".docx", ".txt", ".md", ".csv", ".pptx"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Unsupported file type: ${ext}`), false);
        }
    },
});
// Export single file middleware
export const uploadMiddleware = upload.single("file");
//# sourceMappingURL=upload.middleware.js.map