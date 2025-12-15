import type { Board } from "../interfaces/board";

interface Props {
  boards: Board[];
}

export const BoardList = ({ boards }: Props) => {
  return (
    <div className="board-list">
      <h1>Mis Tableros</h1>
      <p>Tienes {boards.length} tableros</p>

      <ul>
        {boards.map((board) => (
          <li key={board._id} style={{ color: board.color }}>
            {board.title}
          </li>
        ))}
      </ul>
    </div>
  );
};
