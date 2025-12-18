import { BoardList } from "@/components/BoardList";
import { CreateBoardForm } from "@/components/CreateBoardForm";
import { useFetchBoards } from "@/hooks/useFetchBoards";

export const Home = () => {
  const {
    boards,
    refreshBoards,
    isLoading,
    error,
    deleteBoard,
    onUpdateBoard,
  } = useFetchBoards();
  return (
    <div className="app-container">
      <h1>Bienvenido a mi App</h1>
      <hr />
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Aquí renderizamos el componente aislado */}
      <CreateBoardForm onBoardCreated={refreshBoards} />

      {isLoading ? (
        <p>Cargando tableros...</p>
      ) : (
        <BoardList
          boards={boards}
          onDeleteBoard={deleteBoard}
          onUpdateBoard={onUpdateBoard}
        />
      )}
    </div>
  );
};
