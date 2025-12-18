import { useParams } from "react-router-dom";

export const BoardDetail = () => {
  const { boardId } = useParams();

  return (
    <div style={{ padding: "20px" }}>
      <h1> Estas dentro del tablero con</h1>
      <code>{boardId}</code>
      <br />
      <br />
      <a href="/">Volver al inicio</a>
    </div>
  );
};
