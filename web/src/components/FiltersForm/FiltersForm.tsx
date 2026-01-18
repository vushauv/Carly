import React, { useMemo, useState } from "react";
import FilterBarLayout from "../FilterBarLayout/FilterBarLayout";
import Input from "../Input/Input";
import styles from "./FiltersForm.module.css"; // or reuse UsersPage.module.css

type FilterFieldType = "text" | "number" | "date";

type FilterFieldDef<K extends string = string> = {
  key: K;
  label: string;
  type: FilterFieldType;

  placeholder?: string;
  hint: string;
  errorMessage: string;
  isRequired?: boolean;
};

type FiltersFormProps<K extends string> = {
  fields: FilterFieldDef<K>[];
  initialValues?: Partial<Record<K, string>>;

  // IMPORTANT: these are what you connect to API calls
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
    <h3 className={styles.subTitle}>Search criteria</h3>

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

            <Input
              type={f.type}
              placeholder={f.placeholder ?? ""}
              hint={f.hint}
              errorMessage={f.errorMessage}
              isRequired={f.isRequired ?? false}
              value={values[f.key]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>

    </FilterBarLayout>
    </>
  );
}

export default FiltersForm;
export type { FilterFieldDef, FilterFieldType };
