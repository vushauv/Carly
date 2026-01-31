import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./CarEditPage.module.css";
import type { Car, CarFeature, UpdateCarRequest } from "../ManageCarsPage/types";
import { carService } from "../ManageCarsPage/carService";
import Button from "../Button/Button";
import Input from "../Input/Input";

const CarEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [car, setCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    color: "",
    fuelType: "",
    status: "",
    price: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get car feature value by name
  const getFeatureValue = (car: Car, featureName: string): string => {
    return car.carFeatures.find(f => f.name === featureName)?.value || "";
  };

  useEffect(() => {
    const loadCar = async () => {
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

        const carData = await carService.getCarById(carId);
        setCar(carData);
        
        // Populate form with current car data
        setFormData({
          brand: getFeatureValue(carData, "brand"),
          model: getFeatureValue(carData, "model"),
          color: getFeatureValue(carData, "color"),
          fuelType: getFeatureValue(carData, "fuelType"),
          status: getFeatureValue(carData, "status"),
          price: carData.price.toString()
        });
      } catch (err) {
        console.error("Failed to load car:", err);
        setError(err instanceof Error ? err.message : "Failed to load car");
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

      // Create updated features array
      const updatedFeatures: CarFeature[] = [
        { dictionaryId: 1, name: "brand", value: formData.brand.trim() },
        { dictionaryId: 2, name: "model", value: formData.model.trim() },
        { dictionaryId: 3, name: "color", value: formData.color.trim() },
        { dictionaryId: 4, name: "fuelType", value: formData.fuelType.trim() },
        { dictionaryId: 5, name: "status", value: formData.status.trim() }
      ].filter(feature => feature.value); // Only include non-empty features

      const updateData: UpdateCarRequest = {
        carFeatures: updatedFeatures,
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
          <div className={styles.formGroup}>
            <label htmlFor="brand" className={styles.label}>Brand *</label>
            <Input
              id="brand"
              type="text"
              value={formData.brand}
              onChange={(value) => handleInputChange("brand", value)}
              placeholder="Enter car brand"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="model" className={styles.label}>Model *</label>
            <Input
              id="model"
              type="text"
              value={formData.model}
              onChange={(value) => handleInputChange("model", value)}
              placeholder="Enter car model"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="color" className={styles.label}>Color</label>
            <Input
              id="color"
              type="text"
              value={formData.color}
              onChange={(value) => handleInputChange("color", value)}
              placeholder="Enter car color"
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
              <option value="">Select status</option>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.label}>Price per day ($) *</label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(value) => handleInputChange("price", value)}
              placeholder="Enter daily rental price"
              required
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