import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./models/users.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ msg: "Método não permitido" });
  }

  const { name, email, password, confirmpassword } = req.body;

  if (!name) return res.status(422).json({ msg: "O nome é obrigatório!" });
  if (!email) return res.status(422).json({ msg: "O email é obrigatório!" });
  if (!password) return res.status(422).json({ msg: "A senha é obrigatória!" });
  if (password !== confirmpassword)
    return res.status(422).json({ msg: "A senha não confere" });

  if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(422).json({ msg: "Usuário já existe" });

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  try {
    const user = new User({ name, email, password: passwordHash });
    await user.save();
    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor" });
  }
}
