const Card = require("../models/Cards");

exports.createCard = async (req, res) => {
  try {
    const { title, listId, boardId } = req.body;
    if (!title || !listId || !boardId)
      return res.status(400).json({ error: "Datos faltantes" });
    const lastCard = await Card.findOne({ listId }).sort({ position: -1 });
    const newPosition = lastCard ? lastCard.position + 1 : 0;
    const newCard = new Card({ title, listId, boardId, position: newPosition });
    const savedCard = await newCard.save();

    res.json(savedCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la tarjeta" });
  }
};

exports.getCardsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const cards = await Card.find({ boardId }).sort({ position: 1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: "Error al obetener las tarjetas" });
  }
};

exports.reorderCards = async (req, res) => {
  console.log("Recibido en reorder:", req.body);
  try {
    const { orderedIds } = req.body;
    const updatedPromises = orderedIds.map((id, index) =>
      Card.findByIdAndUpdate(id, { position: index }),
    );
    await Promise.all(updatedPromises);
    res.json({ message: "Orden Actualizado" });
  } catch (error) {
    console.log("El error fue este", error);
    res.status(500).json({ error: "No se pudo actualizar la posicion " });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      "title",
      "description",
      "completed",
      "position",
      "deadline",
      "labels",
      "checklist",
      "pomodoros",
      "pomodoroTarget",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    const updatedCard = await Card.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedCard) {
      return res.status(404).json({ error: "Card no encontrada" });
    }

    res.json(updatedCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar" });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteCard = await Card.findByIdAndDelete(id);

    if (!deleteCard) {
      return res.status(404).json({ error: "Card no encontrado" });
    }

    res.json({ message: "Card eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar la Card" });
  }
};
