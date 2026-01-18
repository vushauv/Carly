import type { ReactNode } from "react";
import Button from "../Button/Button";
import styles from "./FilterBarLayout.module.css";

export interface FilterBarProps {
  children: ReactNode;
  onApply: () => void;
  onReset: () => void;
}

const FilterBar = ({ children, onApply, onReset }: FilterBarProps) => {
  return (
    <div className={styles.searchShell}>
      <div className={styles.searchCriteria}>{children}</div>
      <div className={styles.searchActions}>
        <div className={styles.buttons}>
          <Button onClick={() => onApply()}>Apply</Button>
          <Button onClick={() => onReset()} color="secondary">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
