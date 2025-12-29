import type { Board } from "@/interfaces/board";
import { useEffect, useState } from "react";

export const useFetchBoard = (boardId: string | undefined) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const fetchBoard = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`http://localhost:4000/boards/${boardId}`);

        if (!res.ok) {
          throw new Error("No se encontro el tablero");
        }
        const data = await res.json();
        setBoard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoard();
  }, [boardId]);
  return { board, isLoading, error };
};
