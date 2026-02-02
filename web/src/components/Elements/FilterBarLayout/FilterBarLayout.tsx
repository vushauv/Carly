import type { ReactNode } from "react";
import Button from "../Button/Button";
import styles from "./FilterBarLayout.module.css";

export interface FilterBarProps {
  children: ReactNode;
  onApply: () => void;
  onReset: () => void;
}

const FilterBarLayout = ({ children, onApply, onReset }: FilterBarProps) => {
  return (
    <div className={styles.searchShell}>
      <div className={styles.searchCriteria}>{children}</div>
      <div className={styles.searchActions}>
        <div className={styles.buttons}>
          <Button onClick={() => onApply()} label="Apply"/>
          <Button onClick={() => onReset()} label="Reset" color="secondary"/>
        </div>
      </div>
    </div>
  );
};

export default FilterBarLayout;
