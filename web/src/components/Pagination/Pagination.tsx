import Button from "../Button/Button.tsx";
import styles from "./Pagination.module.css";

type PaginationProps = {
  currentPage: number;          // 1-based
  totalPages: number;           // >= 1

  onPrev: () => void;
  onNext: () => void;

  disabled?: boolean;           // disable whole pagination
  showPageInfo?: boolean;       // default true
};

export default function Pagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  disabled = false,
  showPageInfo = true,
}: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);

  const prevDisabled = disabled || safeCurrent <= 1;
  const nextDisabled = disabled || safeCurrent >= safeTotal;

  return (
    <div className={`${styles.pagination}`}>
      <Button disabled={prevDisabled} onClick={onPrev} label="Prev"/>


      {showPageInfo && (
        <span className={styles.pageInfo}>
          Page {safeCurrent} / {safeTotal}
        </span>
      )}

      <Button disabled={nextDisabled} onClick={onNext} label="Next"/>
    </div>
  );
}
