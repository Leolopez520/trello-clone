import { useEffect, useState } from "react";
import type { Board } from "../interfaces/board";

export const useFetchBoards = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = async () => {
    try {
      const res = await fetch("http://localhost:4000/boards");

      if (!res.ok) {
        throw new Error("Error al cargar los datos");
      }
      const data = await res.json();
      console.log("Datos recibidos:", data);
      setBoards(data);
    } catch (err) {
      console.error("Error:", err);
      setError("Ocurrio un error al cargar los tableros");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBoard = async (id: string) => {
    if (!window.confirm("¿Estas seguro de eliminar este tablero?")) return;

    try {
      const res = await fetch(`http://localhost:4000/boards/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchBoards();
      } else {
        setError("No se pudo eliminar el tablero");
      }
    } catch (err) {
      setError("Error de conexión al eliminar");
    }
  };

  const onUpdateBoard = async (idToUpdate: string, newTitle: string) => {
    const updatedList = boards.map((board) => {
      if (board._id === idToUpdate) {
        return { ...board, title: newTitle };
      }
      return board;
    });
    setBoards(updatedList);

    try {
      const res = await fetch(`http://localhost:4000/boards/${idToUpdate}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar en el servidor");
      }
    } catch {
      console.error(error);
      setError("No se pudo guardar, recarga la pagina");
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return {
    boards,
    isLoading,
    error,
    refreshBoards: fetchBoards,
    deleteBoard,
    onUpdateBoard,
  };
};
