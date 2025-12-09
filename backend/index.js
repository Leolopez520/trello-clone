require("dotenv").config();
const Board = require("./models/Board");
const List = require("./models/List");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ mesage: "Succesfull" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB Exitosamente"))
  .catch((error) => console.error("Error de conexión", error));

const PORT = process.env.PORT || 4000;

app.post("/boards", async (req, res) => {
  try {
    const { title, color } = req.body;
    const newBoard = new Board({
      title: title,
      color: color,
    });

    const savedBoard = await newBoard.save();
    res.json(savedBoard);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el tablero" });
  }
});

//Crear una lista
app.post("/lists", async (req, res) => {
  try {
    const { title, boardId } = req.body;

    const boardExists = await Board.findById(boardId);
    if (!boardExists) {
      return res.status(404).json({ error: "El tablero no existe" });
    }

    const newList = new List({
      title,
      boardId,
    });

    const savedList = await newList.save();
    res.json(savedList);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la lista" });
  }
});

app.get("/boards", async (req, res) => {
  try {
    const boards = await Board.find();
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los tableros" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
