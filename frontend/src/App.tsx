import { RouterProvider } from "react-router-dom";
import { appRouter } from "./router/app.router";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <RouterProvider router={appRouter} />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
