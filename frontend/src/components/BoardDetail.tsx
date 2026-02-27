import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableCard } from "@/components/SortableCard";
import { CreateListForm } from "@/components/CreateListForm";
import { useFetchBoard } from "@/hooks/useFetchBoard";
import { useFetchCards } from "@/hooks/useFetchCards";
import { useFetchLists } from "@/hooks/useFetchLists";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { CardDetailModal } from "@/components/CardDetailModal";
import { ListColumn } from "./ListColumn";
import type { Card } from "@/interfaces/card";
import { EditableTitle } from "./EditableTitle";
import { useBoardDragAndDrop } from "@/hooks/useBoardDragAndDrop";
import { useCardOperations } from "@/hooks/useCardOperations";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FloatingTimer } from "./FloatingTimer";

export const BoardDetail = () => {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const { boardId } = useParams();

  // 1. PRIMERO: Obtener los datos y los setters (El origen de la verdad)
  const { board, setBoard, error, isLoading } = useFetchBoard(boardId);
  const { lists, refreshLists, setLists } = useFetchLists(boardId);
  const { cards, refreshCards, setCards } = useFetchCards(boardId);

  // 2. SEGUNDO: Pasar esos datos al hook de operaciones
  // (Este hook necesita que 'cards', 'setCards', etc. ya existan)
  const {
    handleDeleteCard,
    handleDeleteList,
    handleToggleCompleted,
    handleUpdateListTitle,
    handleUpdateTitle,
    handleUpdateCard,
  } = useCardOperations(
    boardId,
    setCards,
    refreshCards,
    refreshLists,
    setBoard,
    activeCard,
    setActiveCard,
  );

  // 3. TERCERO: Hook de Drag & Drop
  const {
    sensors,
    activeDragCard,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    closestCenter,
  } = useBoardDragAndDrop(cards, lists, setCards, setLists);

  if (!board) return <div className="p-10 text-white">Cargando tablero...</div>;
  if (!boardId) return <div className="p-10 text-white">Error: No ID</div>;

  return (
    <div className="h-screen flex flex-col min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-x-auto">
      {/* HEADER */}
      <div className="bg-black/40 px-4 py-3 flex justify-between items-center text-white backdrop-blur-md border-b border-white/10 shadow-sm">
        <EditableTitle
          initialState={board.title || ""}
          onSave={handleUpdateTitle}
          className="text-xl md:text-2xl font-black text-white tracking-tight"
        />

        <Link
          to="/"
          className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition"
        >
          ← Volver
        </Link>
      </div>

      {/* DND AREA */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto p-4 flex items-start gap-4">
          <SortableContext
            items={lists.map((l) => l._id)}
            strategy={horizontalListSortingStrategy}
          >
            {lists.map((list) => {
              const cardsInThisList = cards.filter(
                (card) => card.listId === list._id,
              );

              return (
                <ListColumn
                  key={list._id}
                  list={list}
                  cards={cardsInThisList}
                  boardId={boardId!}
                  onUpdateTitle={handleUpdateListTitle}
                  onDeleteList={handleDeleteList}
                  onUpdateCard={handleUpdateCard}
                  onDeleteCard={handleDeleteCard}
                  onToggleCompleted={handleToggleCompleted}
                  setActiveCard={setActiveCard}
                  refreshCards={refreshCards}
                />
              );
            })}
          </SortableContext>

          <CreateListForm boardId={boardId!} onListCreated={refreshLists} />
        </div>

        <DragOverlay>
          {activeDragCard ? (
            <div className="opacity-80 rotate-3 cursor-grabbing">
              <SortableCard
                card={activeDragCard}
                onUpdate={() => {}}
                onDelete={() => {}}
                onClick={() => {}}
                onToggleCompleted={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* MODAL */}
      {activeCard && (
        <CardDetailModal
          card={activeCard}
          onClose={() => setActiveCard(null)}
          onUpdate={handleUpdateCard}
        />
      )}

      <FloatingTimer cards={cards} onUpdateCard={handleUpdateCard} />
    </div>
  );
};
