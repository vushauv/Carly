import { useState } from "react";
import styles from "./LoginPage.module.css";
import Button from "../Button/Button";

const LoginPage = () => {
  const [error, setError] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>("Error Area");
  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.pageHeading}>
        <h2 className={styles.title}>Sign in To Carly</h2>
        <p className={styles.subtitle}>Access your admin dashboard</p>
      </div>
      <fieldset className={styles.formWrapper}>
        <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
          {error ? (
            <div className={styles.errorArea}>
              <p className={styles.errorMessage}>{errorMessage}</p>
            </div>
          ) : null}
          <div className={styles.inputField}>
            <label>Email:</label>
            <input type="email" required className={styles.input}></input>
          </div>
          <Button>Send Code</Button>
          <div className={styles.inputField}>
            <input type="text" className={styles.input}></input>
          </div>
          <Button>Enter</Button>
        </form>
      </fieldset>
    </section>
  );
};

export default LoginPage;
