import { useState } from "react";
import { toast } from "sonner";

interface Props {
  onBoardCreated: () => void;
}

export const CreateBoardForm = ({ onBoardCreated }: Props) => {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#cbd5e1");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, color }),
      });

      if (res.ok) {
        console.log("¡Tablero creado con éxito!");
        toast.success("Tablero creado con exito");
        setTitle("");
        onBoardCreated();
      } else {
        console.error("Falló la creación");
        toast.error("Falló la creación");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      style={{ marginBottom: "20px", display: "flex", gap: "10px" }}
    >
      <input
        type="text"
        placeholder="Nombre del tablero"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        title="Selecciona un color"
      />

      <button type="submit">Crear tablero</button>
    </form>
  );
};
