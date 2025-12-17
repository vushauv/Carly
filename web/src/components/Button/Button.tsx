import cn from "classnames";
import styles from "./Button.module.css";
import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
  color?: "primary" | "secondary";
}

const Button = ({
  children,
  className,
  color = "primary",
  ...props
}: ButtonProps) => {
  //...props to pass any other button attributes like onClick, disabled, etc.
  return (
    <button
      className={cn(styles.button, className, {
        [styles.primary]: color === "primary",
        [styles.secondary]: color === "secondary",
      })}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
