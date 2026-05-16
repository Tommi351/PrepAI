const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`MessageBubble ${isUser ? "user-style" : "bot-style"}`}>
      <p>{message.content}</p>
    </div>
  );
};

export default MessageBubble;
