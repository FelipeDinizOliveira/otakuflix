import style from "./SubmitButton.module.css";

export function SubmitButton({ label }) {
  return (
    <>
      <button type="submit" className={style.onSubmit}>
        {label}
      </button>
    </>
  );
}
