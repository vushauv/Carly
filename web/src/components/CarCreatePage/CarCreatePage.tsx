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

  /* =========================
     Load reference data
     ========================= */
  useEffect(() => {
    referenceService
      .getCarReferences()
      .then(res => {
        const map: RefMap = {};
        res.referenceData.forEach(d => {
          switch (d.name) {
            case "Brand":
              map.brand = d;
              break;
            case "Model":
              map.model = d;
              break;
            case "Color":
              map.color = d;
              break;
            case "Fuel type":
              map.fuelType = d;
              break;
            case "Status":
              map.status = d;
              break;
          }
        });

        console.log("Mapped reference data:", map);

        setRefs(map);
      })
      .catch(() => setError("Failed to load reference data"))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

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
    } catch {
      setError("Failed to create car");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.page}>Loading…</div>;
  }

  console.log("Rendering CarCreatePage with refs:", refs.brand);

  /* =========================
     Render
     ========================= */
  return (
    <div className={styles.page}>
      <h1>Add New Car</h1>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={submit} className={styles.form}>

        {/* BRAND */}
        <label>Brand *</label>
        <select
          value={formData.brand}
          onChange={e => setField("brand", e.target.value)}
        >
          <option value="">Select brand</option>
          {refs.brand?.values
            .map(v => (
              <option key={v.id} value={v.value}>
                {v.value}
              </option>
            ))}
        </select>

        <input
          placeholder="Or enter new brand"
          value={formData.brand}
          onChange={e => setField("brand", e.target.value)}
        />

        {/* MODEL */}
        <label>Model *</label>
        <input
          value={formData.model}
          onChange={e => setField("model", e.target.value)}
        />

        {/* COLOR */}
        <label>Color</label>
        <select
          value={formData.color}
          onChange={e => setField("color", e.target.value)}
        >
          <option value="">Select color</option>
          {refs.color?.values
            .filter(v => v.value?.trim())
            .map(v => (
              <option key={v.id} value={v.value}>
                {v.value}
              </option>
            ))}
        </select>

        <input
          placeholder="Or enter new color"
          value={formData.color}
          onChange={e => setField("color", e.target.value)}
        />

        {/* FUEL */}
        <label>Fuel type</label>
        <select
          value={formData.fuelType}
          onChange={e => setField("fuelType", e.target.value)}
        >
          <option value="">Select fuel</option>
          {refs.fuelType?.values
            .filter(v => v.value?.trim())
            .map(v => (
              <option key={v.id} value={v.value}>
                {v.value}
              </option>
            ))}
        </select>

        <input
          placeholder="Or enter new fuel type"
          value={formData.fuelType}
          onChange={e => setField("fuelType", e.target.value)}
        />

        {/* STATUS */}
        <label>Status</label>
        <select
          value={formData.status}
          onChange={e => setField("status", e.target.value)}
        >
          <option value="">Select status</option>
          {refs.status?.values
            .filter(v => v.value?.trim())
            .map(v => (
              <option key={v.id} value={v.value}>
                {v.value}
              </option>
            ))}
        </select>

        {/* PRICE */}
        <label>Price *</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={e => setField("price", e.target.value)}
        />

        <Button type="submit" label={saving ? "Creating…" : "Create"} />
      </form>
    </div>
  );
};

export default CarCreatePage;
