import { useFetchBoards } from "../hooks/useFetchBoards";

export const BoardList = () => {
  const { boards, isLoading, error } = useFetchBoards();

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
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
