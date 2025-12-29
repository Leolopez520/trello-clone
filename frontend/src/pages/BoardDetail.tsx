import { CardItem } from "@/components/CardItem";
import { CreateListForm } from "@/components/CreateListForm";
import { CreateCardForm } from "@/components/CreateCardForm";
import { useFetchBoard } from "@/hooks/useFetchBoard";
import { useFetchCards } from "@/hooks/useFetchCards";
import { useFetchLists } from "@/hooks/useFetchLists";
import { Link, useParams } from "react-router-dom";

export const BoardDetail = () => {
  const { boardId } = useParams();

  const { board } = useFetchBoard(boardId);
  const { lists, refreshLists } = useFetchLists(boardId);
  const { cards, refreshCards } = useFetchCards(boardId);

  if (!board) return <div className="p-10">Loading...</div>;
  if (!boardId) return <div className="p-10">Loading...</div>;

  //Función para actualizar
  const handleUpdateCard = async (cardId: string, newTitle: string) => {
    try {
      await fetch(`http://localhost:4000/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      refreshCards();
    } catch (error) {
      console.error("Error updating", error);
    }
  };

  //Para borrar
  const handleDeleteCard = async (cardId: string) => {
    try {
      await fetch(`http://localhost:4000/cards/${cardId}`, {
        method: "DELETE",
      });
      refreshCards();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: board.color + 70 }}
    >
      <div className="bg-black p-4 flex justify-between items-center text-white backdrop-blur-sm ">
        <h1 className="text-3xl font-bold">{board.title}</h1>

        <Link
          to="/"
          className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition"
        >
          ← Volver
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto p-4 flex items-start gap-4">
        {lists.map((list) => (
          <div
            key={list._id}
            className="min-w-[272px] bg-gray-100 rounded-lg p-2 shadow-md"
          >
            <h3 className="font-bold text-gray-700 px-2 mb-2">{list.title}</h3>
            <CreateCardForm
              boardId={boardId}
              listId={list._id}
              onCardCreated={refreshCards}
            />
            <div className="flex flex-col gap-2 mt-2">
              {cards
                .filter((card) => card.listId === list._id)
                .map((card) => (
                  <CardItem
                    key={card._id}
                    card={card}
                    onUpdate={handleUpdateCard}
                    onDelete={handleDeleteCard}
                  />
                ))}
            </div>
          </div>
        ))}

        <CreateListForm boardId={boardId} onListCreated={refreshLists} />
      </div>
    </div>
  );
};
