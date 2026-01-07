import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { SortableCard } from "@/components/SortableCard";
import { CreateListForm } from "@/components/CreateListForm";
import { CreateCardForm } from "@/components/CreateCardForm";
import { useFetchBoard } from "@/hooks/useFetchBoard";
import { useFetchCards } from "@/hooks/useFetchCards";
import { useFetchLists } from "@/hooks/useFetchLists";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { CardDetailModal } from "@/components/CardDetailModal";
import type { Card } from "@/interfaces/card";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { DeleteBtn } from "./DeleteBtn";
import { EditableTitle } from "./EditableTitle";

export const BoardDetail = () => {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const { boardId } = useParams();

  const { board, setBoard, error, isLoading } = useFetchBoard(boardId);
  const { lists, refreshLists } = useFetchLists(boardId);
  const { cards, refreshCards, setCards } = useFetchCards(boardId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  if (!board) return <div className="p-10">Loading...</div>;
  if (!boardId) return <div className="p-10">Loading...</div>;

  //Funcion para marcar como completado
  const handleToggleCompleted = async (
    cardId: string,
    currentStatus: boolean
  ) => {
    const newStatus = !currentStatus;

    setCards((prevCards) =>
      prevCards.map((card) =>
        card._id === cardId ? { ...card, completed: newStatus } : card
      )
    );

    if (activeCard && activeCard._id === cardId) {
      setActiveCard((prev) =>
        prev ? { ...prev, completed: newStatus } : null
      );
    }

    try {
      const res = await fetch(`http://localhost:4000/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newStatus }),
      });
      console.log("Respuesta del server:", res.ok);
      if (res.ok) {
        refreshLists();
        toast.success(newStatus ? "Tarea completada" : "Tarea pendiente");
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("Error al conectar con el servidor");
      refreshLists();
    }
  };

  //Función para actualizar
  const handleUpdateCard = async (
    cardId: string,
    newTitle: string,
    newDescription?: string
  ) => {
    try {
      const res = await fetch(`http://localhost:4000/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });
      if (!res.ok) throw new Error("Error en servidor");
      setCards((prevCards) =>
        prevCards.map((card) =>
          card._id === cardId
            ? {
                ...card,
                title: newTitle,
                description: newDescription || card.description,
              }
            : card
        )
      );
      if (activeCard && activeCard._id === cardId) {
        setActiveCard((prev) =>
          prev
            ? { ...prev, title: newTitle, description: newDescription || "" }
            : null
        );
      }

      toast.success("¡Cambios guardados!");
    } catch (error) {
      toast.error("No se pudo guardar la tarjeta");
      console.error("Error updating", error);
    }
  };

  //Funcion para actualizar un titulo desde el tablero
  const handleUpdateTitle = async (newTitle: string) => {
    try {
      const res = await fetch(`http://localhost:4000/boards/${boardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setBoard((prev) => {
          if (!prev) return null;
          return { ...prev, title: newTitle };
        });
      }
    } catch (error) {
      console.error("Error al actualizar el titulo", error);
    }
  };

  //Funcion para cambiar el titulo de la Lista
  const handleUpdateListTitle = async (listId: string, newTitle: string) => {
    try {
      const res = await fetch(`http://localhost:4000/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        refreshLists();
      }
    } catch (error) {
      console.error("Error al actualizar el titulo", error);
    }
  };

  //Funcion para eliminar una lista
  const handleDeleteList = async (listId: string) => {
    try {
      await fetch(`http://localhost:4000/lists/${listId}`, {
        method: "DELETE",
      });
      refreshLists();
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  //Para borrar
  const handleDeleteCard = async (cardId: string) => {
    try {
      await fetch(`http://localhost:4000/cards/${cardId}`, {
        method: "DELETE",
      });
      refreshCards();
      if (activeCard?._id === cardId) setActiveCard(null);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  //Funcion para mover las tarjetas dentro de su lista
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id == over.id) return;
    const oldIndex = cards.findIndex((card) => card._id === active.id);
    const newIndex = cards.findIndex((card) => card._id === over.id);
    const sortedCards = arrayMove(cards, oldIndex, newIndex);
    setCards(sortedCards);

    const orderedIds = sortedCards.map((card) => card._id);
    try {
      await fetch(`http://localhost:4000/cards/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (error) {}
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: board.color + 70 }}
    >
      <div className="bg-black p-4 flex justify-between items-center text-white backdrop-blur-sm ">
        <EditableTitle
          initialState={board.title || ""}
          onSave={handleUpdateTitle}
          className="text-3xl font-bold text-white"
        />

        <Link
          to="/"
          className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition"
        >
          ← Volver
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto p-4 flex items-start gap-4">
        {lists.map((list) => {
          const cardsInThisList = cards.filter(
            (card) => card.listId === list._id
          );

          return (
            <div
              key={list._id}
              className="min-w-68 bg-gray-100 rounded-lg p-2 shadow-md"
            >
              <div className="flex justify-between">
                <EditableTitle
                  initialState={list.title}
                  onSave={(newTitle) =>
                    handleUpdateListTitle(list._id, newTitle)
                  }
                  className="font-bold text-gray-700 px-2 mb-2"
                />

                <DeleteBtn handleDelete={() => handleDeleteList(list._id)} />
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="flex flex-col gap-2 mt-2">
                  <SortableContext
                    items={cardsInThisList.map((card) => card._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {cardsInThisList.map((card) => (
                      <SortableCard
                        key={card._id}
                        card={card}
                        onUpdate={handleUpdateCard}
                        onDelete={handleDeleteCard}
                        onClick={() => setActiveCard(card)}
                        onToggleCompleted={handleToggleCompleted}
                      />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>

              <CreateCardForm
                boardId={boardId}
                listId={list._id}
                onCardCreated={refreshCards}
              />
            </div>
          );
        })}

        <CreateListForm boardId={boardId} onListCreated={refreshLists} />
        {activeCard && (
          <CardDetailModal
            card={activeCard}
            onClose={() => setActiveCard(null)}
            onUpdate={handleUpdateCard}
          />
        )}
      </div>
    </div>
  );
};
