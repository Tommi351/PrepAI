import { useState } from "react";
import ModeSelector from "../chat/ModeSelector";
import DocumentSelector from "../chat/DocumentSelector";

type ChatBoxProps = {
  mode: string;
  setMode: (mode: string) => void;
  onSend: (msg: string) => void;
  documents: any[];
  documentId: string;
  setDocumentId: (id: string) => void;
};

const ChatBox = ({
  onSend,
  mode,
  setMode,
  documents,
  documentId,
  setDocumentId,
}: ChatBoxProps) => {
  const [input, setInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!input.trim()) return;

    onSend(input);
    setInput("");
  }

  function handleInputChange(evt) {
    setInput(evt.target.value);
  }

  return (
    <div className="chat-input">
      <DocumentSelector
        documents={documents}
        documentId={documentId}
        setDocumentId={setDocumentId}
      />
      <ModeSelector mode={mode} setMode={setMode} />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter a message"
          value={input}
          onChange={handleInputChange}
        />
        <button type="submit" disabled={!documentId}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
