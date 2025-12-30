require("dotenv").config();
const Board = require("./models/Board");
const List = require("./models/List");
const Card = require("./models/Cards");
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

app.delete("/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteBoard = await Board.findByIdAndDelete(id);

    if (!deleteBoard) {
      return res.status(404).json({ error: "Tablero no encontrado" });
    }

    res.json({ message: "Tablero eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar el tablero" });
  }
});

app.put("/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const updatedBoard = await Board.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    if (!updatedBoard) {
      return res.status(404).json({ error: "Tablero no encontrado" });
    }
    res.json(updatedBoard);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el tablero " });
  }
});

app.get("/boards/:id", async (req, res) => {
  console.log("¡Alguien tocó la puerta! Buscando ID:", req.params.id);
  try {
    const { id } = req.params;
    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ error: "Tablero no encontrado" });
    }
    res.json(board);
  } catch {
    res.status(500).json({ error: "Error al obtener el tablero" });
  }
});

app.get("/lists/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params;
    const lists = await List.find({ boardId });

    res.json(lists);
  } catch (error) {
    console.error("🔴 EL ERROR REAL ES:", error);
    res.status(500).json({ error: "Error al obtener las listas" });
  }
});

app.post("/cards", async (req, res) => {
  try {
    const { title, listId, boardId } = req.body;
    if (!title || !listId || !boardId)
      return res.status(400).json({ error: "Datos faltantes" });
    const newCard = new Card({ title, listId, boardId });
    const savedCard = await newCard.save();
    res.json(savedCard);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la tarjeta" });
  }
});

app.get("/cards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params;
    const cards = await Card.find({ boardId });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: "Error al obetener las tarjetas" });
  }
});

app.put("/cards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description } = req.body;
    const updatedCard = await Card.findByIdAndUpdate(
      boardId,
      { title, description },
      { new: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ error: "Card no encontrado" });
    }
    res.json(updatedCard);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar la tarjeta " });
  }
});

app.delete("/cards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params;
    const deleteCard = await Card.findByIdAndDelete(boardId);

    if (!deleteCard) {
      return res.status(404).json({ error: "Card no encontrado" });
    }

    res.json({ message: "Card eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar la Card" });
  }
});
