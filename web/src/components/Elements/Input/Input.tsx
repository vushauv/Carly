import { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./Input.module.css";

import infoIcon from "@/assets/icons/info-icon.svg"



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
  

  /**
   * 🔑 Sync internal error state with external errorMessage
   */
  useEffect(() => {
    setError(Boolean(errorMessage));
  }, [errorMessage]);

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
          onChange={(e) => {
            onChange?.(e.target.value);
          }}
          required={isRequired}
        />

        {(hint || errorMessage) && (
          <img
            src={infoIcon}
            alt="Hint"
            onClick={() => setHintVisibility((state) => !state)}
            onMouseDown={(e) => e.preventDefault()}
          />
        )}
      </div>

      {hintVisibility && (hint || errorMessage) && (
        <p
          className={cn(styles.formNote, {
            [styles.error]: error,
          })}
        >
          {error ? errorMessage : hint}
        </p>
      )}
    </div>
  );
}

export default Input;
