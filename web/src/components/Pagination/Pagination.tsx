import Button from "../Button/Button.tsx";
import styles from "./Pagination.module.css";

type PaginationProps = {
  currentPage: number;        // 1-based
  hasNextPage: boolean;

  onPrev: () => void;
  onNext: () => void;

  disabled?: boolean;
  showPageInfo?: boolean;     // default true
};

export default function Pagination({
  currentPage,
  hasNextPage,
  onPrev,
  onNext,
  disabled = false,
  showPageInfo = true,
}: PaginationProps) {
  const safeCurrent = Math.max(1, currentPage);

  const prevDisabled = disabled || safeCurrent <= 1;
  const nextDisabled = disabled || !hasNextPage;

  return (
    <div className={styles.pagination}>
      <Button
        disabled={prevDisabled}
        onClick={onPrev}
        label="Prev"
      />

      {showPageInfo && (
        <span className={styles.pageInfo}>
          Page {safeCurrent}
        </span>
      )}

      <Button
        disabled={nextDisabled}
        onClick={onNext}
        label="Next"
      />
    </div>
  );
}
