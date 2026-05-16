import { uploadService } from "../services/upload.service.js";
import { insertFilesIntoDocument } from "../services/document.service.js";
import { processService } from "../services/process.service.js";
import { generateEmbeddingsForSections } from "../services/embedService.js";
export const fileUpload = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(400).json({ error: "No authorization token provided" });
        }
        // Step 1: Upload the file
        const uploadResult = await uploadService({ file, token });
        if (!uploadResult) {
            return res.status(400).json({ error: "Can't upload file" });
        }
        // insert uploaded file into documents table
        const document = await insertFilesIntoDocument({
            filePath: uploadResult.filePath,
            fileName: file.originalname,
            token,
        });
        if (!document) {
            res
                .status(400)
                .json({ error: "Can't insert files into documents table" });
        }
        // Fire and forget, this is an immediate response so that we can start the background job
        res.status(202).json({
            message: "Upload successful. Processing your textbook...",
            document_id: document.document_id,
        });
        // The background job for processing and generating embeddings. Launch and let it run while users see the 202 response
        (async () => {
            try {
                // Step A: Parse PDF and insert text sections
                const sections = await processService({
                    document_id: document.document_id,
                    token,
                });
                // Step B: Generate vectors and update the DB
                await generateEmbeddingsForSections({
                    sections,
                    token,
                    document_id: document.document_id,
                });
            }
            catch (bgError) {
                console.error("Background processing pipeline is unsuccessful", bgError);
            }
        })();
    }
    catch (error) {
        console.error("FULL UPLOAD PIPELINE ERROR:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown",
        });
    }
};
//# sourceMappingURL=upload.controller.js.map