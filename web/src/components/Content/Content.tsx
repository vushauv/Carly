import type { ReactNode } from "react";
import styles from "./Content.module.css";

export interface ContentProps {
  children: ReactNode;
}

const Content = ({ children }: ContentProps) => {
  return <main className={styles.content}>{children}</main>;
};

export default Content;
