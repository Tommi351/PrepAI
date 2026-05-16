import { processService } from "../services/process.service.js";
export const processDocument = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(400).json({ error: "No authorization token provided" });
        }
        const { document_id } = await req.body;
        if (!document_id) {
            throw new Error("Can't find user's document");
        }
        const processedResult = await processService({ document_id, token });
        return res.status(200).json({
            message: "Document processed successfully",
            data: processedResult,
        });
    }
    catch (error) {
        console.error("Failed to process user's documents: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown",
        });
    }
};
//# sourceMappingURL=process.controller.js.map