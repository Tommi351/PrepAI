import { chatService } from "../services/chat.service.js";
export const chatWithDocuments = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(400).json({ error: "No authorization token provided" });
        }
        const { document_id, message, mode } = req.body;
        if (!document_id) {
            return res.status(400).json({ error: "Can't find the user's document" });
        }
        if (!message) {
            return res.status(400).json({ error: "Can't get user messages" });
        }
        const getMessages = await chatService({
            token,
            message,
            document_id,
            mode,
        });
        return res.status(200).json({
            success: true,
            message: "User successfuly chats with documents",
            data: getMessages,
        });
    }
    catch (error) {
        console.error("Failed to chat with documents");
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
//# sourceMappingURL=chat.controller.js.map