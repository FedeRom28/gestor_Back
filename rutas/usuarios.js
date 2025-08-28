import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config(); // ✅ Inicializa dotenv antes de usar process.env

const router = express.Router();
const LlaveSecreta = process.env.SECRET_KEY; // Ya no es necesario el valor por defecto

router.post("/registro", async (req, res) => {
  const { User, Password } = req.body;
  console.log("📩 Datos recibidos en /registro:", req.body);

  if (!User || !Password) {
    console.log("❌ Faltan datos en registro");
    return res.status(400).send("Faltan datos");
  }

  try {
    // Verificar si el usuario ya existe
    const checkQuery = "SELECT * FROM usuario WHERE User = ?";
    db.query(checkQuery, [User], async (err, results) => {
      if (err) {
        console.error("❌ Error al verificar usuario existente:", err);
        return res.status(500).send("Error en la base de datos");
      }

      if (results.length > 0) {
        console.log("⚠️ Usuario ya existe:", User);
        return res.status(409).send("El usuario ya existe");
      }

      // Hashear la contraseña y registrar usuario
      const hashedPassword = await bcrypt.hash(Password, 10);
      const insertQuery = "INSERT INTO usuario (User, Password) VALUES (?, ?)";
      db.query(insertQuery, [User, hashedPassword], (err, result) => {
        if (err) {
          console.error("❌ Error al registrar usuario:", err);
          return res.status(500).send("Error al registrar usuario");
        }
        console.log("✅ Usuario registrado con ID:", result.insertId);
        res.json({ mensaje: "Usuario registrado exitosamente" });
      });
    });
  } catch (error) {
    console.error("🔥 Error en /registro:", error);
    res.status(500).send("Error en el servidor");
  }
});

// ------------------- LOGIN -------------------
router.post("/login", (req, res) => {
  const { User, Password } = req.body;
  console.log("📩 Datos recibidos en /login:", req.body);

  if (!User || !Password) {
    console.log("❌ Faltan datos en login");
    return res.status(400).send("Faltan datos");
  }

  const query = "SELECT * FROM usuario WHERE User = ?";
  db.query(query, [User], async (err, results) => {
    if (err) {
      console.error("❌ Error en query de login:", err);
      return res.status(500).send("Error en la base de datos");
    }

    if (results.length === 0) {
      console.log("⚠️ Usuario no encontrado:", User);
      return res.status(401).send("Credenciales incorrectas");
    }

    const usuario = results[0];
    const match = await bcrypt.compare(Password, usuario.Password);

    if (!match) {
      console.log("❌ Password incorrecto para usuario:", User);
      return res.status(401).send("Credenciales incorrectas");
    }

    const token = jwt.sign(
      { id: usuario.ID, User: usuario.User },
      LlaveSecreta,
      { expiresIn: "1h" }
    );

    console.log("🎫 Token generado:", token);
    res.json({ mensaje: "Login exitoso", token });
  });
});

export default router;