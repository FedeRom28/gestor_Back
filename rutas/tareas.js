import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware para verificar el token y obtener el usuario
function verificarToken(req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token) return res.status(401).send("Token no proporcionado");

  jwt.verify(token, process.env.SECRET_KEY, (err, usuario) => {
    if (err) return res.status(403).send("Token inválido");
    req.usuario = usuario; // contiene id y User
    next();
  });
}

// GET tareas del usuario
router.get("/", verificarToken, (req, res) => {
  const usuarioID = req.usuario.id;

  const query = "SELECT * FROM tarea WHERE Usuario_ID = ?";
  db.query(query, [usuarioID], (err, resultados) => {
    if (err) return res.status(500).send("Error al obtener tareas");
    res.json(resultados);
  });
});

// POST crear tarea
router.post("/", verificarToken, (req, res) => {
  const { Titulo, Descripcion } = req.body;
  const usuarioID = req.usuario.id;

  if (!Titulo || !Descripcion)
    return res.status(400).send("Faltan título o descripción");

  const query = `
    INSERT INTO tarea (Usuario_ID, Titulo, Descripcion, Estado, Fecha_Creacion, Fecha_Cambio)
    VALUES (?, ?, ?, 0, NOW(), NOW())
  `;

  db.query(query, [usuarioID, Titulo, Descripcion], (err, result) => {
    if (err) return res.status(500).send("Error al crear tarea");
    res.json({ mensaje: "Tarea creada", tareaID: result.insertId });
  });
});

// PUT actualizar tarea
router.put("/:id", verificarToken, (req, res) => {
  const { id } = req.params;
  const { Titulo, Descripcion, Estado } = req.body;
  const usuarioID = req.usuario.id;

  if (!Titulo || !Descripcion || Estado === undefined)
    return res.status(400).send("Faltan datos para actualizar");

  const query = `
    UPDATE tarea SET Titulo = ?, Descripcion = ?, Estado = ?, Fecha_Cambio = NOW()
    WHERE ID = ? AND Usuario_ID = ?
  `;

  db.query(query, [Titulo, Descripcion, Estado, id, usuarioID], (err, result) => {
    if (err) return res.status(500).send("Error al actualizar tarea");
    if (result.affectedRows === 0)
      return res.status(404).send("Tarea no encontrada");
    res.json({ mensaje: "Tarea actualizada" });
  });
});

// DELETE eliminar tarea
router.delete("/:id", verificarToken, (req, res) => {
  const { id } = req.params;
  const usuarioID = req.usuario.id;

  const query = "DELETE FROM tarea WHERE ID = ? AND Usuario_ID = ?";
  db.query(query, [id, usuarioID], (err, result) => {
    if (err) return res.status(500).send("Error al eliminar tarea");
    if (result.affectedRows === 0)
      return res.status(404).send("Tarea no encontrada");
    res.json({ mensaje: "Tarea eliminada" });
  });
});

export default router;
