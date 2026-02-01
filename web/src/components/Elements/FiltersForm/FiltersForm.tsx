import React, { useMemo, useState } from "react";
import FilterBarLayout from "../FilterBarLayout/FilterBarLayout";
import Input from "../Input/Input";
import styles from "./FiltersForm.module.css";

type FilterFieldType = "text" | "number" | "date" | "select";

type FilterFieldDef<K extends string = string> = {
  key: K;
  label: string;
  type: FilterFieldType;
  placeholder?: string;
  hint: string;
  errorMessage: string;
  isRequired?: boolean;
  options?: { value: string; label: string }[]; // For 'select' type
};

type FiltersFormProps<K extends string> = {
  fields: FilterFieldDef<K>[];
  initialValues?: Partial<Record<K, string>>;
  onApply: (values: Record<K, string>) => void;
  onReset?: () => void;
};

function FiltersForm<K extends string>({
  fields,
  initialValues,
  onApply,
  onReset,
}: FiltersFormProps<K>) {
  const defaults = useMemo(() => {
    const base = {} as Record<K, string>;
    fields.forEach((f) => {
      base[f.key] = initialValues?.[f.key] ?? "";
    });
    return base;
  }, [fields, initialValues]);

  const [values, setValues] = useState<Record<K, string>>(defaults);

  return (
    <>
      <h3 className={styles.subTitle}>Search criterias</h3>

      <FilterBarLayout
        onApply={() => onApply(values)}
        onReset={() => {
          setValues(defaults);
          onReset?.();
        }}
      >
        <div className={styles.filters}>
          {fields.map((f) => (
            <div key={f.key} className={styles.field}>
              <span className={styles.label}>{f.label}</span>

              {f.type === "select" ? (
                <div className={styles.inputWrapper}>
                  <select
                    value={values[f.key] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    className={styles.select}
                  >
                    <option value="">{f.placeholder || "Select an option"}</option>
                    {f.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {f.hint && (
                    <img
                      src="/src/assets/icons/info-icon.svg"
                      alt="Hint"
                      className={styles.hintIcon}
                      title={f.hint}
                    />
                  )}
                </div>
              ) : (
                <Input
                  type={f.type}
                  placeholder={f.placeholder ?? ""}
                  hint={f.hint}
                  errorMessage={f.errorMessage}
                  isRequired={f.isRequired ?? false}
                  value={values[f.key] ?? ""}
                  onChange={(val) =>
                    setValues((prev) => ({ ...prev, [f.key]: val }))
                  }
                />
              )}

            </div>
          ))}
        </div>
      </FilterBarLayout>
    </>
  );
}

export default FiltersForm;
export type { FilterFieldDef, FilterFieldType };
