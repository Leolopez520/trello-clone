const List = require("../models/List");
const Board = require("../models/Board");

exports.createList = async (req, res) => {
  try {
    const { title, boardId } = req.body;

    const boardExists = await Board.findById(boardId);
    if (!boardExists) {
      return res.status(404).json({ error: "El tablero no existe" });
    }

    const lastList = await List.findOne({ boardId }).sort({ position: -1 });
    const newPosition = lastList ? lastList.position + 1 : 0;
    const newList = new List({
      title,
      boardId,
      position: newPosition,
    });

    const savedList = await newList.save();
    res.json(savedList);
  } catch (error) {
    console.error("Error en createList:", error);
    res.status(500).json({ error: "Error al crear la lista" });
  }
};

exports.reorderLists = async (req, res) => {
  console.log("Reordenando listas:", req.body);
  try {
    const { orderedIds } = req.body;

    // Recorremos los IDs y actualizamos su posición (0, 1, 2...)
    const updatePromises = orderedIds.map((id, index) =>
      List.findByIdAndUpdate(id, { position: index }),
    );

    await Promise.all(updatePromises);
    res.json({ message: "Orden de listas actualizado correctamente" });
  } catch (error) {
    console.error("Error reordenando listas:", error);
    res.status(500).json({ error: "Error al reordenar listas" });
  }
};

exports.updateTitleList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const updatedList = await List.findByIdAndUpdate(
      id,
      { title },
      { new: true },
    );

    if (!updatedList) {
      return res.status(404).json({ error: "Lista no encontrada" });
    }
    res.json(updatedList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el titulo " });
  }
};

exports.getLists = async (req, res) => {
  try {
    const { boardId } = req.params;
    const lists = await List.find({ boardId }).sort({ position: 1 });

    res.json(lists);
  } catch (error) {
    console.error("🔴 EL ERROR REAL ES:", error);
    res.status(500).json({ error: "Error al obtener las listas" });
  }
};

exports.deleteLists = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteList = await List.findByIdAndDelete(id);

    if (!deleteList) {
      return res.status(404).json({ error: "List no encontrado" });
    }

    res.json({ message: "Lista eliminada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar la Lista" });
  }
};
