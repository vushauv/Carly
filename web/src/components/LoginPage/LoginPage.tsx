import { useState } from "react";
import styles from "./LoginPage.module.css";
import Button from "../Button/Button";
import Input from "../Input/Input";

const LoginPage = () => {
  const [error, setError] = useState<boolean>(false);
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
            <label
              htmlFor="email" /*htmlFor activates the input once the label is clicked*/
            >
              Email:
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              hint="example@gmail.com"
              errorMessage="Enter a valid email address"
              className={styles.input}
              isRequired={true}
            ></Input>
          </div>
          <Button>Send Code</Button>
          <div className={styles.inputField}>
            <label htmlFor="code">Code:</label>
            <Input
              id="code"
              type="text"
              placeholder="Code"
              hint="Check your email to get the code"
              errorMessage="Enter n-digit code"
              className={styles.input}
              isRequired={true}
            ></Input>
          </div>
          <Button>Enter Code</Button>
        </form>
      </fieldset>
    </section>
  );
};

export default LoginPage;
