import express from "express";
import db from "../db.js";
import { verificarToken } from "../middlewares/autenticar.js";

const router = express.Router();

router.get("/obtenerCategorias", verificarToken, (req, res) => {
  const query = "SELECT * FROM categoria";

  db.query(query, (err, resultados) => {
    if (err) return res.status(500).send("Error al obtener categorias");
    res.json(resultados);
  });
});

export default router;