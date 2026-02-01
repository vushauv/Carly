import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./CarEditPage.module.css";
import type { Car, CarFeature, UpdateCarRequest } from "../services/types";
import { carService } from "../services/carService";
import Button from "../../Button/Button";
import {
  referenceService,
  type ReferenceDictionary
} from "../../../shared/referenceService";

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

const CarEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [car, setCar] = useState<Car | null>(null);
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

  // Build CarFeature helper (same as CarCreatePage)
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

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("Car ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const carId = parseInt(id);
        if (isNaN(carId)) {
          throw new Error("Invalid car ID");
        }

        // Load both car data and reference data in parallel
        const [carData, refData] = await Promise.all([
          carService.getCarById(carId),
          referenceService.getCarReferences()
        ]);

        setCar(carData);

        // Process reference data
        const list = refData.referenceData;
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
        
        // Helper function to get car feature value by name - using carData directly
        const getFeatureValue = (featureName: string): string => {
          const featureNameMap: Record<string, string> = {
            'brand': 'Brand',
            'model': 'Model', 
            'fuelType': 'Fuel type',
            'status': 'Status',
            'color': 'Color'
          };
          
          const apiFeatureName = featureNameMap[featureName];
          if (!apiFeatureName) {
            return carData.carFeatures.find(f => f.name === featureName)?.value || "";
          }
          
          return carData.carFeatures.find(f => f.name === apiFeatureName)?.value || "";
        };
        
        // Populate form with current car data
        setFormData({
          brand: getFeatureValue("brand"),
          model: getFeatureValue("model"),
          color: getFeatureValue("color"),
          fuelType: getFeatureValue("fuelType"),
          status: getFeatureValue("status"),
          price: carData.price.toString()
        });
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!car || !id) return;

    // Validate required fields
    if (!formData.brand.trim() || !formData.model.trim() || !formData.price.trim()) {
      setError("Brand, model, and price are required");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError("Price must be a valid positive number");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Build car features using reference dictionaries (same as CarCreatePage)
      const carFeatures: CarFeature[] = [
        buildFeature(refs.brand, formData.brand),
        buildFeature(refs.model, formData.model),
        buildFeature(refs.color, formData.color),
        buildFeature(refs.fuelType, formData.fuelType),
        buildFeature(refs.status, formData.status)
      ].filter(Boolean) as CarFeature[];

      const updateData: UpdateCarRequest = {
        carFeatures,
        price: price
      };

      await carService.updateCar(parseInt(id), updateData);
      
      // Navigate back to car view page
      navigate(`/cars/${id}`);
    } catch (err) {
      console.error("Failed to update car:", err);
      setError(err instanceof Error ? err.message : "Failed to update car");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading car details...</div>
      </div>
    );
  }

  if (error && !car) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          {error}
        </div>
        <Button label="Back to Cars" onClick={() => navigate("/cars")} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Car</h1>
        <div className={styles.actions}>
          <Button label="Cancel" onClick={() => navigate(`/cars/${id}`)} />
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
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

          {/* FUEL TYPE */}
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
          <Button
            label="Cancel"
            type="button"
            onClick={() => navigate(`/cars/${id}`)}
            disabled={saving}
          />
          <Button
            label={saving ? "Saving..." : "Save Changes"}
            type="submit"
            disabled={saving}
          />
        </div>
      </form>
    </div>
  );
};

export default CarEditPage;