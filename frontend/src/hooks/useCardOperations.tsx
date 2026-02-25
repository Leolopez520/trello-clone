import { toast } from "sonner";
import type { Card, Label, PomodoroSession } from "@/interfaces/card";
import type { Board } from "@/interfaces/board";
import type { CheckListItem } from "../interfaces/card";

export const useCardOperations = (
  boardId: string | undefined,
  setCards: React.Dispatch<React.SetStateAction<Card[]>>,
  refreshCards: () => void,
  refreshLists: () => void,
  setBoard: React.Dispatch<React.SetStateAction<Board | null>>,
  activeCard: Card | null,
  setActiveCard: React.Dispatch<React.SetStateAction<Card | null>>,
) => {
  //Funcion para marcar como completado
  const handleToggleCompleted = async (
    cardId: string,
    currentStatus: boolean,
  ) => {
    const newStatus = !currentStatus;

    setCards((prevCards) =>
      prevCards.map((card) =>
        card._id === cardId ? { ...card, completed: newStatus } : card,
      ),
    );

    if (activeCard && activeCard._id === cardId) {
      setActiveCard((prev) =>
        prev ? { ...prev, completed: newStatus } : null,
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
        {
          currentStatus === false
            ? toast.success("Tarea Completada")
            : toast.info("Tarea desmarcada");
        }
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
    newDescription: string,
    newDeadline: string | undefined,
    newLabels: Label[],
    checklist: CheckListItem[],
    pomodoros: PomodoroSession[],
    pomodoroTarget: number,
    recurrence: string,
  ) => {
    try {
      // Preparamos el cuerpo de la petición
      const body = {
        title: newTitle,
        description: newDescription,
        deadline: newDeadline,
        labels: newLabels,
        checklist,
        pomodoros,
        pomodoroTarget,
        recurrence,
      };

      const res = await fetch(`http://localhost:4000/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error en servidor");

      // Actualización Optimista (UI instantánea)
      setCards((prevCards) =>
        prevCards.map((card) =>
          card._id === cardId
            ? {
                ...card,
                title: newTitle,
                description: newDescription,
                deadline: newDeadline,
                labels: newLabels,
                checklist: checklist,
                pomodoros: pomodoros,
                pomodoroTarget: pomodoroTarget,
              }
            : card,
        ),
      );

      // Si la tarjeta está abierta en el modal, actualizamos su estado también
      if (activeCard && activeCard._id === cardId) {
        setActiveCard((prev) =>
          prev
            ? {
                ...prev,
                title: newTitle,
                description: newDescription,
                deadline: newDeadline,
                labels: newLabels,
                checkList: checklist,
                pomodoros: pomodoros,
                pomodoroTarget: pomodoroTarget,
              }
            : null,
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

  return {
    handleDeleteCard,
    handleDeleteList,
    handleToggleCompleted,
    handleUpdateListTitle,
    handleUpdateTitle,
    handleUpdateCard,
  };
};
