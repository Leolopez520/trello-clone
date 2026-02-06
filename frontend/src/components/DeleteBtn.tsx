import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface Props {
  handleDelete: () => void;
}

export const DeleteBtn = ({ handleDelete }: Props) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-red-600"
          onClick={(e) => e.stopPropagation()}
        >
          🗑️
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogTitle>¿Eliminar?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción no se puede deshacer.
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-0 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200 cursor-pointer">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="bg-red-600 text-white hover:bg-red-900 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
