import React from "react";
import Button from "../Button/Button.tsx";
import styles from "./Pagination.module.css";

type PaginationProps = {
  currentPage: number;          // 1-based
  totalPages: number;           // >= 1

  onPrev: () => void;
  onNext: () => void;

  // Optional extras
  className?: string;
  disabled?: boolean;           // disable whole pagination
  showPageInfo?: boolean;       // default true
  prevLabel?: React.ReactNode;  // default "Prev"
  nextLabel?: React.ReactNode;  // default "Next"
};

export default function Pagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  className,
  disabled = false,
  showPageInfo = true,
  prevLabel = "Prev",
  nextLabel = "Next",
}: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);

  const prevDisabled = disabled || safeCurrent <= 1;
  const nextDisabled = disabled || safeCurrent >= safeTotal;

  return (
    <div className={`${styles.pagination} ${className ?? ""}`}>
      <Button disabled={prevDisabled} onClick={onPrev} label="< prev">
        {prevLabel}
      </Button>

      {showPageInfo && (
        <span className={styles.pageInfo}>
          Page {safeCurrent} / {safeTotal}
        </span>
      )}

      <Button disabled={nextDisabled} onClick={onNext} label="next >">
        {nextLabel}
      </Button>
    </div>
  );
}
