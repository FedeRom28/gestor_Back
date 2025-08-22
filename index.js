import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import tareaRutas from "./rutas/tareas.js";
import usuarioRutas from "./rutas/usuarios.js";
import categoriaRutas from "./rutas/categorias.js"

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/usuario", usuarioRutas);
app.use("/api/tareas", tareaRutas);
app.use("/api/categorias", categoriaRutas);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});