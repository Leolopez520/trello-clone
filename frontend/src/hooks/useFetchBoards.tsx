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

  useEffect(() => {
    fetchBoards();
  }, []);

  return { boards, isLoading, error, refreshBoards: fetchBoards };
};
