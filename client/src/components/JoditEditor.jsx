import React, { useRef } from "react";
import { Jodit } from "jodit-react";

const JoditEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  return (
    <Jodit
      ref={editorRef}
      value={value}
      onChange={(e) => {
        onChange(e);
      }}
    />
  );
};

export default JoditEditor;
