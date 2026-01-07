import { useEffect, useState } from "react";

interface Props {
  initialState: string;
  onSave: (newTitle: string) => void;
  className?: string;
}

export const EditableTitle = ({ initialState, onSave, className }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialState);

  useEffect(() => {
    setTitle(initialState);
  }, [initialState]);

  const handleSave = () => {
    setIsEditing(false);
    if (title.trim() && title !== initialState) {
      onSave(title);
    } else {
      setTitle(initialState);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setTitle(initialState);
      setIsEditing(false);
    }
    if (e.key === "Enter") {
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`px-2 py-1 rounded border border-blue-500 outline-none text-black cursor-pointer ${className}`}
      />
    );
  }
  return (
    <h1
      onClick={() => setIsEditing(true)}
      className={`px-2 py-1 rounded cursor-pointer hover:bg-white/20 transition-colors ${className}`}
    >
      {title}
    </h1>
  );
};
