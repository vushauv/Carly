import { useState } from "react";
import cn from "classnames";
import styles from "./Input.module.css";

type NativeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
>;

export interface InputProps extends NativeInputProps {
  type: string;

  value?: string;
  onChange?: (value: string) => void;

  
  hint?: string;
  errorMessage?: string;
  isRequired?: boolean;
}

function Input({
  type,
  value = "",
  onChange,

  hint = "",
  errorMessage = "",
  isRequired = false,

  ...rest
}: InputProps) {
  const [hintVisibility, setHintVisibility] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div>
      <div
        className={cn(styles.inputWrapper, {
          [styles.error]: error,
        })}
      >
        <input
          {...rest}
          type={type}
          className={styles.input}
          value={value}
          aria-describedby="input-desc"
          onChange={(e) => {
            if (error) setError(false);
            onChange?.(e.target.value);
          }}
          onInvalid={() => setError(true)}
          onInvalidCapture={(e) => e.preventDefault()}
          required={isRequired}
        />

        <img
          src="/src/assets/icons/info-icon.svg"
          alt="Hint"
          onClick={() => setHintVisibility((state) => !state)}
          onMouseDown={(e) => e.preventDefault()}
        />
      </div>

      {hintVisibility ? (
        <p
          className={cn(styles.formNote, { [styles.error]: error })}
          id="input-desc"
        >
          {error ? errorMessage : hint}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
