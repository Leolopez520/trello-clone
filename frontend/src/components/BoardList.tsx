import { useFetchBoards } from "@/hooks/useFetchBoards";
import type { Board } from "../interfaces/board";
import { BoardItem } from "./BoardItem";

interface Props {
  boards: Board[];
  onDeleteBoard: (id: string) => void;
  onUpdateBoard: (id: string, newTitle: string) => void;
}

export const BoardList = ({ boards, onDeleteBoard, onUpdateBoard }: Props) => {
  return (
    <div className="board-list">
      <h1>Mis Tableros</h1>
      <p>Tienes {boards.length} tableros</p>

      <ul>
        {boards.map((board) => (
          <li key={board._id} style={{ color: board.color }}>
            <BoardItem
              board={board}
              onDelete={onDeleteBoard}
              onUpdate={onUpdateBoard}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
