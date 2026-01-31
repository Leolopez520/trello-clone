import { useState } from "react";
import { Button } from "./ui/button";

interface Props {
  boardId: string;
  onListCreated: () => void;
}

export const CreateListForm = ({ boardId, onListCreated }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("http://localhost:4000/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json " },
        body: JSON.stringify({ title, boardId }),
      });

      if (res.ok) {
        setTitle("");
        onListCreated();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error creando lista:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setTitle("");
    }
  };

  if (isEditing) {
    return (
      <div>
        <form
          onSubmit={handleSubmit}
          className="min-w-68 bg-gray-100 rounded-lg p-2 shadow-md max-h-[80vh] w-72 shrink-0 flex flex-col"
        >
          <input
            autoFocus
            placeholder="Introduce el titulo de la lista"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-2 border-gray-300 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-800 text-white h-8"
            >
              Añadir lista
            </Button>

            <Button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-72 shrink-0">
      <Button
        onClick={() => setIsEditing(true)}
        className="w-full bg-black/80 hover:bg-white/40 text-white font-bold py-3 px-3 rounded-xl text-left transition flex items-center gap-2 backdrop-blur-sm shadow-sm"
      >
        <span>+</span>Añadir otra lista
      </Button>
    </div>
  );
};
