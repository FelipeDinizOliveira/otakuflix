import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import { User } from "./models/users.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// =======================
// CORS configurado para o front hospedado no Vercel
// =======================
app.use(
  cors({
    origin: [
      "https://otakuflix-two.vercel.app", // domínio do front
      "http://localhost:5173", // opcional: front local durante desenvolvimento
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
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
  } catch {
    return res.status(400).json({ msg: "Token inválido!" });
  }
}

// =======================
// Rotas públicas
// =======================
app.get("/", (req, res) => res.status(200).json({ msg: "Iniciando API!" }));

// Registro de usuário
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
    console.log(err);
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
    console.log(err);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
});

// Rota privada: buscar usuário por ID
app.get("/user/:id", checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) return res.status(404).json({ msg: "Usuário não encontrado!" });
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
});

// =======================
// Conexão MongoDB + start server
// =======================
const PORT = process.env.PORT || 3000;

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3rshl4g.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Conectado ao MongoDB");
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => console.log("Erro ao conectar no MongoDB:", err));
