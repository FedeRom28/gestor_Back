// routes/tareas.js
import express from "express";
import db from "../db.js";
import { verificarToken } from "../middlewares/autenticar.js";

const router = express.Router();

// GET: obtener todas las tareas del usuario
router.get("/obtenerTareas", verificarToken, (req, res) => {
  const usuarioID = req.usuario.id;

  const query = `
    SELECT t.ID, t.Descripcion, t.Estado, 
           t.Fecha_Creacion, t.Fecha_Cambio, t.Categoria_ID, 
           c.Tipo AS Categoria
    FROM tarea t
    LEFT JOIN categoria c ON t.Categoria_ID = c.ID
    WHERE t.Usuario_ID = ?
  `;

  db.query(query, [usuarioID], (err, resultados) => {
    if (err) return res.status(500).send("Error al obtener tareas");
    res.json(resultados);
  });
});

// POST: crear nueva tarea
router.post("/crearTarea", verificarToken, (req, res) => {
  const { Descripcion, Categoria_ID } = req.body;
  const usuarioID = req.usuario.id;

  if (!Descripcion)
    return res.status(400).send("Falta descripción");

  const query = `
    INSERT INTO tarea (Usuario_ID, Descripcion, Estado, Fecha_Creacion, Fecha_Cambio, Categoria_ID)
    VALUES (?, ?, 0, NOW(), NOW(), ?)
  `;

  db.query(query, [usuarioID, Descripcion, Categoria_ID], (err, result) => {
    if (err) return res.status(500).send("Error al crear tarea");
    res.json({ mensaje: "Tarea creada", tareaID: result.insertId });
  });
});

// PUT: actualizar descripción y categoría de la tarea
router.put("/actualizarTarea/:id", verificarToken, (req, res) => {
  const { id } = req.params;
  const { Descripcion, Categoria_ID } = req.body;
  const usuarioID = req.usuario.id;

  if (!Descripcion)
    return res.status(400).send("Falta descripción para actualizar");

  const query = `
    UPDATE tarea 
    SET Descripcion = ?, Categoria_ID = ?, Fecha_Cambio = NOW()
    WHERE ID = ? AND Usuario_ID = ?
  `;

  db.query(query, [Descripcion, Categoria_ID, id, usuarioID], (err, result) => {
    if (err) return res.status(500).send("Error al actualizar tarea");
    if (result.affectedRows === 0)
      return res.status(404).send("Tarea no encontrada");
    res.json({ mensaje: "Tarea actualizada" });
  });
});

// PATCH: cambiar estado (0 o 1)
router.patch("/cambiarEstado/:id", verificarToken, (req, res) => {
  const { id } = req.params;
  const { Estado } = req.body;
  const usuarioID = req.usuario.id;

  if (Estado === undefined || (Estado !== 0 && Estado !== 1))
    return res.status(400).send("Estado inválido");

  const query = `
    UPDATE tarea SET Estado = ?, Fecha_Cambio = NOW()
    WHERE ID = ? AND Usuario_ID = ?
  `;

  db.query(query, [Estado, id, usuarioID], (err, result) => {
    if (err) return res.status(500).send("Error al cambiar estado");
    if (result.affectedRows === 0)
      return res.status(404).send("Tarea no encontrada");
    res.json({ mensaje: "Estado actualizado" });
  });
});

// DELETE: eliminar tarea
router.delete("/eliminarTarea/:id", verificarToken, (req, res) => {
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