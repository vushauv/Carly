import React from "react";
import Button from "../Button/Button";
import styles from "./DataTable.module.css";



export type ColumnDef<T> = {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  width: string; // REQUIRED: "8%", "200px", etc.
  headerClassName?: string;
  cellClassName?: string;
};

export type RowAction<T> = {
  id: string;
  label: string;
  color?: "primary" | "secondary";
  onClick: (row: T) => void;
  isVisible?: (row: T) => boolean;
  isDisabled?: (row: T) => boolean;
};


type DataTableProps<T> = {
  rows: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string | number;

  actions: RowAction<T>[];
  emptyText?: string;
};

export default function DataTable<T>({
  rows,
  columns,
  rowKey,
  actions,
  emptyText = "No data found.",
}: DataTableProps<T>) {
  return (
    <div className={styles.table}>
      {/* HEADER */}
      <div className={`${styles.row} ${styles.header}`}>
        {columns.map((c) => (
          <div
            key={c.id}
            className={`${styles.cell} ${c.headerClassName ?? ""}`}
            style={{ ["--col-grow" as any]: c.width }}
          >
            {c.header}
          </div>
        ))}

        <div className={`${styles.cell} ${styles.actionsHeader}`}>
          Actions
        </div>
      </div>

      {/* BODY */}
      {rows.map((row) => (
        <div key={rowKey(row)} className={styles.row}>
          {columns.map((c) => (
            <div
              key={c.id}
              className={`${styles.cell} ${c.cellClassName ?? ""}`}
              style={{ ["--col-grow" as any]: c.width }}
            >
              {c.cell(row)}
            </div>
          ))}

          <div className={`${styles.cell} ${styles.actions}`}>
            {actions!.map((a) =>
              a.isVisible && !a.isVisible(row) ? null : (
                <Button
                  key={a.id}
                  disabled={a.isDisabled?.(row)}
                  onClick={() => a.onClick(row)}
                  label={a.label}
                  color={a.color}
                />
              )
            )}
          </div>
        </div>
      ))}

      {rows.length === 0 && (
        <div className={styles.empty}>{emptyText}</div>
      )}
    </div>
  );
}

  

