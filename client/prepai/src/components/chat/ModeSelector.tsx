const ModeSelector = ({ mode, setMode }) => {
  return (
    <div className="mode-selector">
      <label htmlFor="mode">Choose a Mode for AI to use: </label>
      <select
        name="mode"
        id="mode-select"
        value={mode}
        onChange={(e) => setMode(e.target.value)}
      >
        <option value="default">Default</option>
        <option value="explain">Explain</option>
        <option value="test">Test</option>
        <option value="study_guide">Study Guide</option>
      </select>
    </div>
  );
};

export default ModeSelector;
