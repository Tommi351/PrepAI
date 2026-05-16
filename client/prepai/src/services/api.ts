import axios from "axios";

export async function getMessages({ message, mode, documentId, token }) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      mode,
      document_id: documentId,
    }),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to chat with user");
  }

  return json.data;
}

export async function uploadFile({ file, token, onProgress }) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },

      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );

        if (onProgress) onProgress(percent);
      },
    },
  );

  return await res.data;
}

export async function fetchDocuments({ token }) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/documents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch documents");
  }

  return json.data;
}
