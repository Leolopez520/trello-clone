import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableCard } from "./SortableCard";
import { CreateCardForm } from "./CreateCardForm";
import { EditableTitle } from "./EditableTitle";
import { DeleteBtn } from "./DeleteBtn";
import type { List } from "@/interfaces/list";
import type { Card, Label } from "@/interfaces/card";

interface Props {
  list: List;
  cards: Card[];
  boardId: string;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDeleteList: (id: string) => void;
  onUpdateCard: (
    id: string,
    title: string,
    desc: string,
    deadline?: string,
    labels?: Label[],
  ) => void;
  onDeleteCard: (id: string) => void;
  onToggleCompleted: (id: string, status: boolean) => void;
  setActiveCard: (card: Card | null) => void;
  refreshCards: () => void;
}

export const ListColumn = ({
  list,
  cards,
  boardId,
  onUpdateTitle,
  onDeleteList,
  onUpdateCard,
  onDeleteCard,
  onToggleCompleted,
  setActiveCard,
  refreshCards,
}: Props) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list._id,
    data: { type: "List", listId: list._id },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Se hace transparente al arrastrar
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="min-w-68 bg-gray-950 rounded-lg p-2 shadow-md max-h-[80vh] w-72 shrink-0 flex flex-col"
    >
      <div className="flex justify-between" {...attributes} {...listeners}>
        <EditableTitle
          initialState={list.title}
          onSave={(newTitle) => onUpdateTitle(list._id, newTitle)}
          className="font-bold text-white px-2 mb-2 break-words"
        />
        <div onPointerDown={(e) => e.stopPropagation()}>
          <DeleteBtn handleDelete={() => onDeleteList(list._id)} />
        </div>
      </div>

      <div className="flex-1 flex-col gap-2 mt-2 overflow-y-auto min-h-0 px-1 overflow-x-hidden">
        <SortableContext
          items={cards.map((card) => card._id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <SortableCard
              key={card._id}
              card={card}
              onUpdate={(id, newTitle) =>
                onUpdateCard(
                  id,
                  newTitle,
                  card.description || "",
                  card.deadline,
                  card.labels,
                )
              }
              onDelete={onDeleteCard}
              onClick={() => setActiveCard(card)}
              onToggleCompleted={onToggleCompleted}
            />
          ))}
        </SortableContext>
      </div>

      <CreateCardForm
        boardId={boardId}
        listId={list._id}
        onCardCreated={refreshCards}
      />
    </div>
  );
};
