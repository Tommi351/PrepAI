import { getDocumentsFromFiles } from "../services/document.service.js";
export const fetchDocuments = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(400).json({ error: "No authorization token provided" });
        }
        const getDocuments = await getDocumentsFromFiles({ token });
        return res.status(200).json({
            success: true,
            message: "Document fetched successfully",
            data: getDocuments,
        });
    }
    catch (error) {
        console.error("Failed to fetch user's documents: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown",
        });
    }
};
//# sourceMappingURL=document.controller.js.map