import cn from "classnames";
import styles from "./Button.module.css";
import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
}

const Button = ({ children, className, ...props}: ButtonProps) => { //...props to pass any other button attributes like onClick, disabled, etc.
  return <button className={cn(styles.button, className)} {...props}>{children}</button>;
};

export default Button;
