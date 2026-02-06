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
      <div className="w-72 shrink-0 px-2 h-fit">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-xl p-3 shadow-2xl border border-gray-700 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200"
        >
          <input
            autoFocus
            placeholder="Introduce el título de la lista..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2.5 text-sm bg-gray-950 text-white border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-gray-500 transition-all shadow-inner"
          />

          <div className="flex items-center gap-2 mt-1">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white h-9 px-4 font-medium shadow-lg shadow-blue-900/20"
            >
              Añadir lista
            </Button>

            <Button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 h-9 w-9 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
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
    <div className="w-72 shrink-0 px-2">
      <Button
        onClick={() => setIsEditing(true)}
        className="w-full bg-black/20 hover:bg-black/40 text-white justify-start h-12 px-4 rounded-xl backdrop-blur-sm border border-white/10 transition-all"
      >
        + Añadir otra lista
      </Button>
    </div>
  );
};
