import type { List } from "@/interfaces/list";
import { useEffect, useState } from "react";

export const useFetchLists = (boardId: string | undefined) => {
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshLists = async () => {
    if (!boardId) return;
    try {
      const res = await fetch(`http://localhost:4000/lists/${boardId}`);
      const data = await res.json();
      setLists(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (boardId) {
      refreshLists().finally(() => setIsLoading(false));
    }
  }, [boardId]);

  return { lists, refreshLists, isLoading, setLists };
};
