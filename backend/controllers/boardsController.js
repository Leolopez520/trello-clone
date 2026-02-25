const Board = require("../models/Board");

exports.createBoard = async (req, res) => {
  try {
    const { title, color } = req.body;
    const newBoard = new Board({
      title,
      color,
    });

    const savedBoard = await newBoard.save();
    res.json(savedBoard);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el tablero" });
  }
};

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find();
    res.json(boards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los tableros" });
  }
};

exports.deleteBoard = async (req, res) => {
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
};

exports.updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const updatedBoard = await Board.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedBoard) {
      return res.status(404).json({ error: "Tablero no encontrado" });
    }
    res.json(updatedBoard);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el tablero " });
  }
};

exports.getBoard = async (req, res) => {
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
};
