import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import tareasRouter from "./rutas/tareas.js";
import rutasUsuarios from "./rutas/usuarios.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/usuario", rutasUsuarios);
app.use("/api/tareas", tareasRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});