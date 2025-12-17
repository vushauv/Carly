import cn from "classnames";
import styles from "./NavbarButton.module.css";
import type { ButtonHTMLAttributes } from "react";

export interface NavbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isActive: boolean;
    children: string;
}

const NavbarButton = ({ children, isActive, className, ...props }: NavbarButtonProps) => {
    return (
        <button
            className={cn(
                styles.button,
                {[styles.active]: isActive},
                className
            )}
            disabled={isActive}
            {...props}
        >
            {children}
        </button>
    );
};

export default NavbarButton;
