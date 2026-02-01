import cn from "classnames";
import styles from "./Button.module.css";
import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  color?: "primary" | "secondary" | "danger";
}

const Button = ({
  label,
  className,
  color = "primary",
  ...rest
}: ButtonProps) => {
  return (
    <button
      {...rest}
      className={cn(styles.button, className, {
        [styles.primary]: color === "primary",
        [styles.secondary]: color === "secondary",
        [styles.danger]: color === "danger",
      })}
    >
      {label}
    </button>
  );
};

export default Button;
