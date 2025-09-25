import { useState } from "react";
import { SubmitButton } from "../components/SubmitButton";
import background from "../assets/background-animes.png";
import styles from "../Pages/SignUp.module.css";

export function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const userData = { name, email, password, confirmpassword };

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      setMessage(data.msg);
    } catch (err) {
      console.error("Erro no fetch:", err);
      setMessage("Erro ao conectar com o servidor");
    }
  };

  return (
    <div>
      <section id={styles.SignUp}>
        <form className={styles.loginForm} onSubmit={handleRegister}>
          <span>
            <h2>Vamos começar?</h2>
            <h2>Crie sua conta</h2>
          </span>
          <span className={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.inputField}
              required
            />

            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
              required
            />

            <input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
              required
            />

            <input
              type="password"
              placeholder="Confirme sua senha"
              value={confirmpassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.inputField}
              required
            />
          </span>

          <span>
            <p>
              Já tem conta? <a href="/">Clique aqui</a>
            </p>
          </span>

          <SubmitButton type="submit" label="Cadastrar" />
          {message && <p id="StatusMsg">{message}</p>}
        </form>
      </section>

      <img src={background} alt="background" id={styles.background} />
    </div>
  );
}
