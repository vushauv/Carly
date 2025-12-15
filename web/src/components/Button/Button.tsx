import cn from "classnames";
import styles from "./Button.module.css";
import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
}

const Button = ({ children, className }: ButtonProps) => {
  return <button className={cn(styles.button, className)}>{children}</button>;
};

export default Button;
