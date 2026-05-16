function DocumentItem({ id, name, status }) {
  return (
    <li>
      <div>
        <h3>{name}</h3>
        <span className={status}>{status}</span>
      </div>
    </li>
  );
}

export default DocumentItem;
