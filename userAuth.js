import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import { User } from "./models/users.js";

dotenv.config();

const app = express();

// =======================
// CORS
// =======================
app.use(
  cors({
    origin: [
      "https://otakuflix-two.vercel.app", // front deployado
      "http://localhost:5173", // front local
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// =======================
// Middleware de autenticação
// =======================
function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Acesso negado!" });

  try {
    jwt.verify(token, process.env.SECRET);
    next();
  } catch (err) {
    console.log("Token inválido:", err);
    return res.status(400).json({ msg: "Token inválido!" });
  }
}

// =======================
// Rotas
// =======================
app.get("/", (req, res) => res.status(200).json({ msg: "Iniciando API!" }));

// Registrar usuário
app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;
  if (!name || !email || !password || password !== confirmpassword)
    return res.status(422).json({ msg: "Dados inválidos!" });

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(422).json({ msg: "Usuário já existe!" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: passwordHash });
    await user.save();

    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (err) {
    console.log("Erro ao registrar usuário:", err);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(422).json({ msg: "Dados inválidos!" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(422).json({ msg: "Usuário não encontrado!" });

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) return res.status(401).json({ msg: "Senha inválida!" });

    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ msg: "Autenticação realizada com sucesso!", token });
  } catch (err) {
    console.log("Erro ao fazer login:", err);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
});

// Buscar usuário por ID
app.get("/user/:id", checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) return res.status(404).json({ msg: "Usuário não encontrado!" });
    res.status(200).json({ user });
  } catch (err) {
    console.log("Erro ao buscar usuário:", err);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
});

// =======================
// Conexão MongoDB + start server
// =======================
const PORT = process.env.PORT || 3000;

console.log("Tentando conectar ao MongoDB...");
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3rshl4g.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Conectado ao MongoDB");
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => console.log("Erro ao conectar no MongoDB:", err));
