import { useNavigate } from "react-router";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Chat with your files to excel on exams</h1>
      <button className="btn" onClick={() => navigate("/files")}>
        Upload
      </button>
      <button className="btn" onClick={() => navigate("/chat")}>
        Chat
      </button>
    </div>
  );
}

export default HomePage;
