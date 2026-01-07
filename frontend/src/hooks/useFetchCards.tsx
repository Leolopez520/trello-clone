import type { Card } from "@/interfaces/card";
import type { List } from "@/interfaces/list";
import { useEffect, useState } from "react";

export const useFetchCards = (boardId: string | undefined) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [lists, setLists] = useState<List[]>([]);

  const refreshCards = async () => {
    if (!boardId) return;
    try {
      const res = await fetch(`http://localhost:4000/cards/${boardId}`);
      const data = await res.json();
      setCards(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (boardId) refreshCards();
  }, [boardId]);

  return { cards, refreshCards, setCards };
};
