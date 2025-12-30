import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface Props {
  listId: string;
  boardId: string;
  onCardCreated: () => void;
}

export const CreateCardForm = ({ listId, boardId, onCardCreated }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("http://localhost:4000/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, listId, boardId }),
      });

      if (res.ok) {
        setTitle("");
        toast.success("Tarjeta creada con exito!");
        onCardCreated();
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creando la tarjeta");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setTitle("");
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="mt-2">
        <textarea
          autoFocus
          className="w-full px-2 py-2 border rounded-md text-sm shadow-sm outline-none resize-none h-20"
          placeholder="Introduce un título para esta tarjeta..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center gap-2 mt-2">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
          >
            Añadir tarjeta
          </Button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            ✕
          </button>
        </div>
      </form>
    );
  }

  return (
    <Button
      onClick={() => setIsEditing(true)}
      className="w-full text-left p-2 mt-2 text-gray-500 hover:bg-gray-200 rounded-md text-sm transition flex items-center gap-2"
    >
      <span>+</span> Añadir una tarjeta
    </Button>
  );
};
