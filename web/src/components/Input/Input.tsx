import { useState, type HTMLAttributes } from "react";
import styles from "./Input.module.css";
import cn from "classnames";

export interface InputProps extends HTMLAttributes<HTMLInputElement> {
  type: string;
  hint: string;
  placeholder: string;
  errorMessage: string;
  isRequired: boolean;
}

function Input({
  type,
  hint,
  placeholder,
  errorMessage,
  isRequired,
}: InputProps) {
  const [hintVisibility, setHintVisibility] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div>
      <div
        /*Classnames is a library which lets you combine multiple styles - also provide optional styles - based on condition*/
        className={cn(styles.inputWrapper, {
          [styles.error]: error, // means - add styles.error when condition error is true
        })}
      >
        <input
          type={type}
          className={styles.input}
          placeholder={placeholder}
          aria-describedby="input-desc"
          onInvalid={() => {
            setError(true);
          }}
          onChange={() => {
            if (error) setError(false);
          }}
          onInvalidCapture={(e) => e.preventDefault()}
          required={isRequired}
        ></input>
        <img
          src="/src/assets/icons/info-icon.svg"
          alt="Hint"
          onClick={() => setHintVisibility((state) => !state)}
        ></img>
      </div>
      <p
        className={cn(styles.formNote, {
          [styles.error]: error,
        })}
        id="input-desc"
      >
        {!hintVisibility ? null : error ? errorMessage : hint}
      </p>
    </div>
  );
}

export default Input;
