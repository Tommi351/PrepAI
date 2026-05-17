import { useState, useEffect } from "react";
import ChatBox from "../components/chat/ChatBox";
import MessageBubble from "../components/chat/MessageBubble";
import { fetchDocuments, getMessages } from "../services/api";
import NavBar from "../components/dashboard/NavBar";
import Spinner from "../components/dashboard/Spinner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState([]);
  const [mode, setMode] = useState("default");
  const [documentId, setDocumentId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDocs() {
      try {
        const docs = await fetchDocuments({
          token: localStorage.getItem("token"),
        });

        setDocuments(docs);
      } catch (error) {
        console.error("Fetch failed: ", error);
        setDocuments([]); // Reset to empty array on error
      }
    }

    loadDocs();
  }, []);

  const handleSend = async (message) => {
    if (!documentId) {
      console.warn("No document selected");
      return;
    }

    const userMessage = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await getMessages({
        message,
        mode,
        documentId,
        token: localStorage.getItem("token"),
      });

      if (!res || !res.answer) {
        throw new Error("Invalid AI response");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.answer,
        },
      ]);
    } catch (err) {
      console.error("Failed to chat with user: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="chat-page">
        <div className="chat-messages">
          {messages.map((msg, m_id) => (
            <MessageBubble key={m_id} message={msg} />
          ))}

          {loading && (
            <>
              <Spinner />
              <MessageBubble
                message={{ role: "assistant", content: "Thinking..." }}
              />
            </>
          )}
        </div>

        <ChatBox
          onSend={handleSend}
          mode={mode}
          setMode={setMode}
          documents={documents}
          documentId={documentId}
          setDocumentId={setDocumentId}
        />
      </div>
    </>
  );
};
