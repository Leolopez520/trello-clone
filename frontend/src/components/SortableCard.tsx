import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardItem } from "./CardItem";
import type { Card } from "@/interfaces/card";

interface Props {
  card: Card;
  onUpdate: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
  onToggleCompleted: (cardId: string, currentStatus: boolean) => void;
}

export const SortableCard = ({
  card,
  onUpdate,
  onClick,
  onDelete,
  onToggleCompleted,
}: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card._id,
    data: { ...card },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <CardItem
        card={card}
        onClick={onClick}
        onDelete={onDelete}
        onToggleCompleted={onToggleCompleted}
        onUpdate={onUpdate}
      />
    </div>
  );
};
