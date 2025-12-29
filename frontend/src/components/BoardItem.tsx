import { useState } from "react";
import { Link } from "react-router-dom";
import type { Board } from "../interfaces/board";
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
    if (!tempTitle.trim()) return setIsEditing(false);

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
      <div className="flex items-center gap-2 p-2">
        <input
          autoFocus
          className="flex-1 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors group">
      <div
        className="w-3 h-3 rounded-full mr-2"
        style={{ backgroundColor: board.color }}
      />
      <Link
        to={`/board/${board._id}`}
        className="flex-1 font-medium hover:text-blue-600 cursor-pointer"
        style={{ color: board.color }}
      >
        {board.title}
      </Link>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(board._id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          🗑️
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(true)}
          className="text-gray-500 hover:text-blue-600"
        >
          ✏️
        </Button>
      </div>
    </div>
  );
};
