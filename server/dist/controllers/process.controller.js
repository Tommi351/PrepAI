import { processService } from "../services/process.service.js";
export const processDocument = async (req, res) => {
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
};
//# sourceMappingURL=process.controller.js.map