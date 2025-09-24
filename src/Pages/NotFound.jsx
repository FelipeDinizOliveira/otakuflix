import styles from "./NotFound.module.css";

export function NotFound() {
  return (
    <div className={styles.notFound}>
      <h1>404 - Página não encontrada</h1>
      <a href="/">Voltar para Home</a>
    </div>
  );
}
