import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CarCreatePage.module.css";

import Button from "../Button/Button";
import { carService } from "../ManageCarsPage/carService";
import type { CarFeature, CreateCarRequest } from "../ManageCarsPage/types";

import {
  referenceService,
  type ReferenceDictionary
} from "../../shared/referenceService";

/* =========================
   Types
   ========================= */

type FormState = {
  brand: string;
  model: string;
  color: string;
  fuelType: string;
  status: string;
  price: string;
};

type RefMap = {
  brand?: ReferenceDictionary;
  model?: ReferenceDictionary;
  color?: ReferenceDictionary;
  fuelType?: ReferenceDictionary;
  status?: ReferenceDictionary;
};

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

/* =========================
   Component
   ========================= */

const CarCreatePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormState>({
    brand: "",
    model: "",
    color: "",
    fuelType: "",
    status: "",
    price: ""
  });

  const [refs, setRefs] = useState<RefMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  /* =========================
     Load reference data
     ========================= */

  useEffect(() => {
    referenceService
      .getCarReferences()
      .then(res => {
        const list = res.referenceData;

        const map: RefMap = {};
        for (const d of list) {
          const n = normalizeName(d.name);
          if (n === "brand") map.brand = d;
          else if (n === "model") map.model = d;
          else if (n === "color") map.color = d;
          else if (n === "fueltype") map.fuelType = d;
          else if (n === "status") map.status = d;
        }

        setRefs(map);

        // Default status (optional UX)
        if (!formData.status && map.status?.values.length) {
          setFormData(prev => ({
            ...prev,
            status: map.status!.values[0].name
          }));
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load reference data");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     Build CarFeature
     ========================= */

  const buildFeature = (
    dict: ReferenceDictionary | undefined,
    value: string
  ): CarFeature | null => {
    if (!dict || !value.trim()) return null;

    return {
      dictionaryId: dict.dictionaryId,
      name: dict.name,
      value: value.trim()
    };
  };

  /* =========================
     Submit
     ========================= */

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brand || !formData.model || !formData.price) {
      setError("Brand, model and price are required");
      return;
    }

    const price = Number(formData.price);
    if (Number.isNaN(price) || price <= 0) {
      setError("Invalid price");
      return;
    }

    const carFeatures: CarFeature[] = [
      buildFeature(refs.brand, formData.brand),
      buildFeature(refs.model, formData.model),
      buildFeature(refs.color, formData.color),
      buildFeature(refs.fuelType, formData.fuelType),
      buildFeature(refs.status, formData.status)
    ].filter(Boolean) as CarFeature[];

    const payload: CreateCarRequest = {
      carFeatures,
      price
    };

    try {
      setSaving(true);
      setError(null);
      await carService.createCar(payload);
      navigate("/cars");
    } catch (err) {
      console.error(err);
      setError("Failed to create car");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.page}>Loading…</div>;
  }

  console.log("Refs:", refs.brand);

  /* =========================
     Render
     ========================= */

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add New Car</h1>
        <Button label="Cancel" onClick={() => navigate("/cars")} />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={submit} className={styles.form}>
        <div className={styles.formGrid}>

          {/* BRAND */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Brand *</label>
            <select
              value={formData.brand}
              onChange={e => setField("brand", e.target.value)}
            >
              <option value="">Select brand</option>
              {refs.brand?.values.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <input
              placeholder="Or type a new brand"
              value={formData.brand}
              onChange={e => setField("brand", e.target.value)}
            />
          </div>

          {/* MODEL */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Model *</label>
            <select
              value={formData.model}
              onChange={e => setField("model", e.target.value)}
            >
              <option value="">Select model</option>
              {refs.model?.values.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <input
              placeholder="Or type a new model"
              value={formData.model}
              onChange={e => setField("model", e.target.value)}
            />
          </div>

          {/* COLOR */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Color</label>
            <select
              value={formData.color}
              onChange={e => setField("color", e.target.value)}
            >
              <option value="">Select color</option>
              {refs.color?.values.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <input
              placeholder="Or type a new color"
              value={formData.color}
              onChange={e => setField("color", e.target.value)}
            />
          </div>

          {/* FUEL */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Fuel type</label>
            <select
              value={formData.fuelType}
              onChange={e => setField("fuelType", e.target.value)}
            >
              <option value="">Select fuel type</option>
              {refs.fuelType?.values.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <input
              placeholder="Or type a new fuel type"
              value={formData.fuelType}
              onChange={e => setField("fuelType", e.target.value)}
            />
          </div>

          {/* STATUS */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Status</label>
            <select
              value={formData.status}
              onChange={e => setField("status", e.target.value)}
            >
              <option value="">Select status</option>
              {refs.status?.values.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* PRICE */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Price per day *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={e => setField("price", e.target.value)}
              placeholder="Enter price"
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <Button type="button" label="Cancel" onClick={() => navigate("/cars")} />
          <Button type="submit" label={saving ? "Creating…" : "Create"} />
        </div>
      </form>
    </div>
  );
};

export default CarCreatePage;
