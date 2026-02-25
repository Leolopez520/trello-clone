require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const cardRoutes = require("./routes/cardRoutes");
const boardRoutes = require("./routes/boardRoutes");
const listsRoutes = require("./routes/listsRoutes");

app.use(cors());
app.use(express.json());
app.use("/boards", boardRoutes);
app.use("/lists", listsRoutes);
app.use("/cards", cardRoutes);

app.get("/", (req, res) => {
  res.json({ mesage: "Succesfull" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB Exitosamente"))
  .catch((error) => console.error("Error de conexión", error));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
