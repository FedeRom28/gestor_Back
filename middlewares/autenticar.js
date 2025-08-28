import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Inicializa dotenv para poder usar process.env

export function verificarToken(req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token) return res.status(401).send("Token no proporcionado");

  jwt.verify(token, process.env.SECRET_KEY, (err, usuario) => {
    if (err) return res.status(403).send("Token inválido");
    req.usuario = usuario; // contiene id y User
    next();
  });
}