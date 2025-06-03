import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY;

router.post("/registro", async (req, res) => {
  const { User, Password, Nombre, Apellido } = req.body;

  if (!User || !Password || !Nombre || !Apellido) {
    return res.status(400).send("Faltan datos");
  }

  try {
    const hashedPassword = await bcrypt.hash(Password, 10); // 10 rounds de sal
    const query = "INSERT INTO usuario (User, Password, Nombre, Apellido) VALUES (?, ?, ?, ?)";
    db.query(query, [User, hashedPassword, Nombre, Apellido], (err, result) => {
      if (err) return res.status(500).send("Error al registrar usuario");
      res.json({ mensaje: "Usuario registrado exitosamente" });
    });
  } catch (error) {
    res.status(500).send("Error en el servidor");
  }
});

router.post("/login", (req, res) => {
  const { User, Password } = req.body;

  const query = "SELECT * FROM usuario WHERE User = ?";
  db.query(query, [User], async (err, results) => {
    if (err) return res.status(500).send("Error en la base de datos");
    if (results.length === 0) return res.status(401).send("Credenciales incorrectas");

    const usuario = results[0];
    const match = await bcrypt.compare(Password, usuario.Password);

    if (!match) return res.status(401).send("Credenciales incorrectas");

    const token = jwt.sign({ id: usuario.ID, User: usuario.User }, process.env.SECRET_KEY, {
      expiresIn: "2h",
    });

    res.json({ mensaje: "Login exitoso", token });
  });
});

export default router;