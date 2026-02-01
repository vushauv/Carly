import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CarCreatePage.module.css";
import type { CarFeature, CreateCarRequest } from "../ManageCarsPage/types";
import { carService } from "../ManageCarsPage/carService";
import Button from "../Button/Button";

const CarCreatePage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    color: "",
    fuelType: "",
    status: "Available",
    price: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      // Create features array with correct API feature names and proper dictionary IDs
      const featureMapping: Array<{formField: keyof typeof formData, dictionaryId: number, apiName: string}> = [
        { formField: 'brand', dictionaryId: 1, apiName: 'CAR_BRANDS' },
        { formField: 'model', dictionaryId: 2, apiName: 'CAR_MODELS' },
        { formField: 'color', dictionaryId: 3, apiName: 'CAR_COLORS' },
        { formField: 'fuelType', dictionaryId: 4, apiName: 'CAR_FUEL_TYPES' },
        { formField: 'status', dictionaryId: 5, apiName: 'CAR_STATUSES' }
      ];

      const features: CarFeature[] = featureMapping
        .filter(mapping => formData[mapping.formField]?.trim()) // Only include non-empty features
        .map(mapping => ({
          dictionaryId: mapping.dictionaryId,
          name: mapping.apiName,
          value: formData[mapping.formField].trim()
        }));

      // Ensure at least the required features are present
      if (features.length === 0) {
        setError("At least one feature must be provided");
        return;
      }

      const createData: CreateCarRequest = {
        carFeatures: features,
        price: price
      };

      console.log("Creating car with data:", createData); // Debug log

      const result = await carService.createCar(createData);
      
      // Navigate to the newly created car's view page
      navigate(`/cars/${result.carId}`);
    } catch (err) {
      console.error("Failed to create car:", err);
      setError(err instanceof Error ? err.message : "Failed to create car");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add New Car</h1>
        <div className={styles.actions}>
          <Button label="Cancel" onClick={() => navigate("/cars")} />
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="brand" className={styles.label}>Brand *</label>
            <input
              id="brand"
              type="text"
              value={formData.brand}
              onChange={(e) => handleInputChange("brand", e.target.value)}
              placeholder="Enter car brand"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="model" className={styles.label}>Model *</label>
            <input
              id="model"
              type="text"
              value={formData.model}
              onChange={(e) => handleInputChange("model", e.target.value)}
              placeholder="Enter car model"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="color" className={styles.label}>Color</label>
            <input
              id="color"
              type="text"
              value={formData.color}
              onChange={(e) => handleInputChange("color", e.target.value)}
              placeholder="Enter car color"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="fuelType" className={styles.label}>Fuel Type</label>
            <select
              id="fuelType"
              value={formData.fuelType}
              onChange={(e) => handleInputChange("fuelType", e.target.value)}
              className={styles.select}
            >
              <option value="">Select fuel type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className={styles.select}
            >
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.label}>Price per day ($) *</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="Enter daily rental price"
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <Button
            label="Cancel"
            type="button"
            onClick={() => navigate("/cars")}
            disabled={saving}
          />
          <Button
            label={saving ? "Creating..." : "Create Car"}
            type="submit"
            disabled={saving}
          />
        </div>
      </form>
    </div>
  );
};

export default CarCreatePage;