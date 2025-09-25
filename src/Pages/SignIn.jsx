import { useState } from "react";
import styles from "./SignIn.module.css";
import { SubmitButton } from "../components/SubmitButton";
import background from "../assets/background-animes.png";
import { useNavigate } from "react-router-dom";

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const loginData = { email, password };

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        // salva o token
        localStorage.setItem("token", data.token);

        // redireciona para página do usuário
        navigate(`/user`);
      } else {
        setMessage(data.msg || "Erro ao fazer login");
      }
    } catch (err) {
      console.error("Erro no fetch:", err);
      setMessage("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className={styles.head}>
        <h2>otaku</h2> <h1>Flix</h1>
      </header>

      <section className={styles.SignIn}>
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <h1>Login</h1>

          <span className={styles.inputWrapper}>
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
          </span>

          <SubmitButton
            className={styles.submitButton}
            type="submit"
            label={loading ? "Entrando..." : "Entrar"}
          />
          {message && <p className={styles.message}>{message}</p>}
        </form>

        <footer>
          <p>
            Ainda não possui conta?
            <strong>
              <a href="/signup"> Cadastre-se </a>
            </strong>
          </p>
        </footer>
      </section>

      <img src={background} alt="background" id={styles.background} />
    </div>
  );
}
