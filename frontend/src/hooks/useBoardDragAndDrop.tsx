import type { Card } from "@/interfaces/card";
import type { List } from "@/interfaces/list";
import {
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";

export const useBoardDragAndDrop = (
  cards: Card[],
  lists: List[],
  setCards: React.Dispatch<React.SetStateAction<Card[]>>,
  setLists: React.Dispatch<React.SetStateAction<List[]>>,
) => {
  const [activeDragCard, setActiveDragCard] = useState<Card | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  //Funcion para que se mover entre listas
  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveACard = cards.find((c) => c._id === activeId);
    const isOverACard = cards.find((c) => c._id === overId);

    if (!isActiveACard) return;

    // A) Si estamos sobre otra TARJETA
    if (isOverACard) {
      if (isActiveACard.listId !== isOverACard.listId) {
        setCards((prev) => {
          const activeIndex = prev.findIndex((c) => c._id === activeId);
          const overIndex = prev.findIndex((c) => c._id === overId);
          let newIndex;
          if (isOverACard) {
            newIndex =
              overIndex >= 0
                ? overIndex +
                  (active.rect.current.translated &&
                  active.rect.current.translated.top >
                    over.rect.top + over.rect.height
                    ? 1
                    : 0)
                : overIndex;
          } else {
            newIndex = overIndex;
          }

          const newCards = [...prev];
          newCards[activeIndex].listId = isOverACard.listId;
          return arrayMove(newCards, activeIndex, newIndex);
        });
      }
    }

    // B) Si estamos sobre una COLUMNA VACÍA (ListColumn)
    // Buscamos si el ID sobre el que estamos coincide con una de nuestras listas
    const isOverAList = lists.find((list) => list._id === overId);

    if (isOverAList) {
      setCards((prev) => {
        const activeIndex = prev.findIndex((c) => c._id === activeId);
        const newCards = [...prev];

        // Si la tarjeta no pertenece ya a esa lista, se la asignamos
        if (newCards[activeIndex].listId !== isOverAList._id) {
          newCards[activeIndex].listId = isOverAList._id;
        }
        return newCards;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragCard(null);

    if (!over) return;

    if (active.data.current?.type === "List") {
      if (active.id === over.id) return;

      // 1. Encontramos los índices viejos y nuevos
      const oldIndex = lists.findIndex((l) => l._id === active.id);
      const newIndex = lists.findIndex((l) => l._id === over.id);

      // 2. Movemos visualmente (Optimistic UI)
      const newLists = arrayMove(lists, oldIndex, newIndex);
      setLists(newLists);

      // 3. Persistencia (Backend)
      try {
        const orderedIds = newLists.map((l) => l._id);
        await fetch(`http://localhost:4000/lists/reorder`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds }),
        });
        console.log("Orden de listas guardado");
      } catch (error) {
        console.error("Error al guardar orden de listas:", error);
        toast.error("Error al guardar el orden");
      }
      return;
    }

    // 1. Identificar la tarjeta y su destino
    const activeCard = cards.find((c) => c._id === active.id);
    if (!activeCard) return;

    let finalListId = activeCard.listId;
    const overCard = cards.find((c) => c._id === over.id);
    const overList = lists.find((l) => l._id === over.id);

    if (overCard) finalListId = overCard.listId;
    if (overList) finalListId = overList._id;

    // 2. Calcular el nuevo estado visual (Arrays)
    let finalCards = [...cards];
    const activeIndex = cards.findIndex((c) => c._id === active.id);
    const overIndex = cards.findIndex((c) => c._id === over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      // Hacemos el movimiento matemático en el array
      finalCards = arrayMove(cards, activeIndex, overIndex);
    }

    // Asignamos el nuevo listId a la tarjeta movida (por si cambió de lista)
    const activeCardIndexInFinal = finalCards.findIndex(
      (c) => c._id === active.id,
    );
    if (activeCardIndexInFinal !== -1) {
      finalCards[activeCardIndexInFinal] = {
        ...finalCards[activeCardIndexInFinal],
        listId: finalListId,
      };
    }

    // 3. ACTUALIZACIÓN VISUAL
    setCards(finalCards);

    // 4. PERSISTENCIA (Backend)
    try {
      // Paso A: Actualizar dueño (listId)
      await fetch(`http://localhost:4000/cards/${active.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: finalListId }),
      });

      // Paso B: Actualizar orden
      const cardsInDestination = finalCards.filter(
        (c) => c.listId === finalListId,
      );
      const orderedIds = cardsInDestination.map((c) => c._id);

      await fetch(`http://localhost:4000/cards/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (error) {
      console.error("Error guardando:", error);
      toast.error("Error al guardar el movimiento");
    }
  };

  //Para conocer en que momento comienza el arraste
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    const foundCard = cards.find((c) => c._id === active.id);
    if (foundCard) {
      setActiveDragCard(foundCard);
    }
  };

  return {
    sensors,
    activeDragCard,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    closestCenter, // Exportamos esto también para limpiar el import del padre
  };
};
