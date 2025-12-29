import { BoardDetail } from "@/pages/BoardDetail";
import { Home } from "@/pages/Home";
import { createBrowserRouter, Navigate } from "react-router-dom";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/board/:boardId",
    element: <BoardDetail />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);
