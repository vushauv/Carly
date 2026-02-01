import { useEffect, useState } from "react";
import styles from "./LoginPage.module.css";
import Button from "../Elements/Button/Button";
import Input from "../Elements/Input/Input";

const LoginPage = () => {
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>("Error Area");
  const [hasRequestedCode, setHasRequestedCode] = useState<boolean>(false); //this will tell us if it should be "send" or "resend" code
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    //this will be executed when cooldown created and then each second
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      //each interval will actually just run for one second (so not each second) because then cooldown will be updated and useEffect will be triggered again (cleanup previous interval and create a new one)
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const startCooldown = () => setCooldown(60);

  const handleSendCode = () => {
    //handle the actual code sending logic here
    if (!hasRequestedCode) {
      setHasRequestedCode(true);
    }
    startCooldown();
  };

  const isCooldownActive = cooldown > 0;

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
          <div className={styles.sendCodeWrapper}>
            <Button
              onClick={handleSendCode}
              disabled={hasRequestedCode && isCooldownActive}
            >
              {!hasRequestedCode ? "Send Code" : "Resend Code"}
            </Button>
            {isCooldownActive ? (
              <span className={styles.cooldownText}> in {cooldown}s</span>
            ) : null}
          </div>
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
