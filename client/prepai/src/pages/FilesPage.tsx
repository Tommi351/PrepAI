import { useState, useEffect, useCallback } from "react";
import UploadBox from "../components/files/UploadBox";
import DocumentList from "../components/files/DocumentList";
import { fetchDocuments } from "../services/api";
import NavBar from "../components/dashboard/NavBar";

function FilesPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const docs = await fetchDocuments({
        token: localStorage.getItem("token"),
      });

      setDocuments(docs);
    } catch (error) {
      setError(error.message || "Failed to fetch user's documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getDocuments();
  }, [getDocuments]);

  return (
    <>
      <NavBar />
      <div>
        <UploadBox onUploadSuccess={getDocuments} />
        <DocumentList documents={documents} />

        {loading && <p>Loading documents...</p>}

        {error && <p>{error}</p>}
      </div>
    </>
  );
}

export default FilesPage;
