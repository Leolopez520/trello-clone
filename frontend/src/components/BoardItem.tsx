import { useState } from "react";
import type { Board } from "../interfaces/board"; // Ajusta la ruta a tu interface
import { Button } from "./ui/button";

interface Props {
  board: Board;
  onUpdate: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

export const BoardItem = ({ board, onUpdate, onDelete }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(board.title);

  const handleSave = () => {
    onUpdate(board._id, tempTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setIsEditing(false);
      setTempTitle(board.title);
    }
  };

  if (isEditing) {
    return (
      <div className="board-item-editing">
        <input
          autoFocus
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
        />
      </div>
    );
  }

  return (
    <div className="board-item">
      <span onClick={() => setIsEditing(true)}>{board.title}</span>
      <Button onClick={() => onDelete(board._id)}>🗑️</Button>
      <Button onClick={() => setIsEditing(true)}>✏️</Button>
    </div>
  );
};
