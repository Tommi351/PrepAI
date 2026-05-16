function DocumentSelector({ documents, documentId, setDocumentId }) {
  return (
    <div>
      <label htmlFor="documents">Choose a document to use: </label>
      <select
        id="document-select"
        value={documentId}
        onChange={(e) => setDocumentId(e.target.value)}
      >
        <option value="">Choose a document to use: </option>

        {documents.length === 0 ? (
          <option disabled>No documents uploaded</option>
        ) : (
          documents.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
}

export default DocumentSelector;
