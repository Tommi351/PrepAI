import DocumentItem from "./DocumentItem";

function DocumentList({ documents }) {
  return (
    <ul>
      {documents.map((d) => (
        <DocumentItem key={d.id} {...d} />
      ))}
    </ul>
  );
}

export default DocumentList;
