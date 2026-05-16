import { useRef, useState } from "react";
import { uploadFile } from "../../services/api";

function UploadBox({ onUploadSuccess }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 1. Opens the file dialog when the SVG/Box is clicked
  const handleBoxClick = () => {
    fileInputRef.current.click();
  };

  // 2. Stores the file in state when selected
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 3. Logic to send the file to your server
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);

    try {
      const fileData = await uploadFile({
        file: selectedFile,
        token: localStorage.getItem("token"),
        onProgress: setProgress,
      });

      if (!fileData) {
        throw new Error("Can't find uploaded file");
      }

      setSelectedFile(null);

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      return fileData;
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <h1>
        PDFS are the only thing allowed to be uploaded for PrepAI to work. More
        file types will be supported soon
      </h1>
      <div onClick={handleBoxClick} className="upload-box">
        <svg width="50px" height="50px" viewBox="0 0 100 100">
          <path d="m82 31.199c0.10156-0.60156-0.10156-1.1992-0.60156-1.6992l-24-24c-0.39844-0.39844-1-0.5-1.5977-0.5h-0.19922-31c-3.6016 0-6.6016 3-6.6016 6.6992v76.5c0 3.6992 3 6.6992 6.6016 6.6992h50.801c3.6992 0 6.6016-3 6.6016-6.6992l-0.003906-56.699v-0.30078zm-48-7.1992h10c1.1016 0 2 0.89844 2 2s-0.89844 2-2 2h-10c-1.1016 0-2-0.89844-2-2s0.89844-2 2-2zm32 52h-32c-1.1016 0-2-0.89844-2-2s0.89844-2 2-2h32c1.1016 0 2 0.89844 2 2s-0.89844 2-2 2zm0-16h-32c-1.1016 0-2-0.89844-2-2s0.89844-2 2-2h32c1.1016 0 2 0.89844 2 2s-0.89844 2-2 2zm0-16h-32c-1.1016 0-2-0.89844-2-2s0.89844-2 2-2h32c1.1016 0 2 0.89844 2 2s-0.89844 2-2 2zm-8-15v-17.199l17.199 17.199z" />
        </svg>

        <p>{selectedFile ? selectedFile.name : "Select a file"}</p>

        {uploading && (
          <div>
            <progress value={progress} max="100" />
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* Upload Button */}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            await handleUpload();
          }}
          disabled={!selectedFile || uploading}
        >
          {uploading ? `Uploading... ${progress}%` : "Upload"}
        </button>
      </div>
    </>
  );
}

export default UploadBox;
