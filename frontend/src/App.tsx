import { BoardList } from "./components/BoardList";

function App() {
  return (
    <div className="app-container">
      <h1>Bienvenido a mi App</h1>
      <hr />

      {/* Aquí renderizamos el componente aislado */}
      <BoardList />
    </div>
  );
}

export default App;
