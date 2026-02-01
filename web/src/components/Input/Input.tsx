import { useState, type InputHTMLAttributes } from "react";
import styles from "./Input.module.css";
import cn from "classnames";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  type: string;
  hint?: string;
  placeholder?: string;
  errorMessage?: string;
  isRequired?: boolean;

  value: string;                    // ✅ allow controlled input
  onChange?: (value: string) => void; // ✅ your pages use this shape
}

function Input({
  type,
  hint = "",
  placeholder = "",
  errorMessage = "",
  isRequired = false,
  value,
  onChange,
  ...rest
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
          {...rest}
          type={type}
          className={styles.input}
          placeholder={placeholder}
          aria-describedby="input-desc"
          value={value}
          onInvalid={() => setError(true)}
          onInvalidCapture={(e) => e.preventDefault()}
          required={isRequired}
          onChange={(e) => {
            if (error) setError(false);
            onChange?.(e.target.value);
          }}
        />

        <img
          src="/src/assets/icons/info-icon.svg"
          alt="Hint"
          onClick={() => setHintVisibility((state) => !state)}
          onMouseDown={(e) => e.preventDefault()}
        //On mouseDown prevents the input to lose focus when the hint button is clicked
        ></img>
      </div>
      {hintVisibility ? (
        <p
          className={cn(styles.formNote, {
            [styles.error]: error,
          })}
          id="input-desc"
        >
          {error ? errorMessage : hint}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
