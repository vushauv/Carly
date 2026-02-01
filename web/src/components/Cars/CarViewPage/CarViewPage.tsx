import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./CarViewPage.module.css";
import type { Car, CarImage } from "../services/types";
import { carService } from "../services/carService";
import Button from "../../Button/Button";

const CarViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [images, setImages] = useState<CarImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Helper function to get car feature value by name - corrected mapping
  const getFeatureValue = (featureName: string): string => {
    // Map display feature types to API feature names (same as datatable fix)
    const featureNameMap: Record<string, string> = {
      'brand': 'Brand',
      'model': 'Model', 
      'fuelType': 'Fuel type',
      'status': 'Status',
      'color': 'Color'
    };
    
    const apiFeatureName = featureNameMap[featureName];
    if (!apiFeatureName) {
      // Fallback: try exact match
      return car?.carFeatures.find(f => f.name === featureName)?.value || "N/A";
    }
    
    return car?.carFeatures.find(f => f.name === apiFeatureName)?.value || "N/A";
  };

  const handleDeleteCar = async () => {
    if (!car) {
      setError("Car data not available");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this car? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      await carService.deleteCar(car.carId);
      // Navigate back to cars list after successful deletion
      navigate("/cars");
    } catch (err) {
      console.error("Failed to delete car:", err);
      setError("Failed to delete car. Please try again.");
    } finally {
      setDeleting(false);
    }
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

        const [carData, imageData] = await Promise.all([
          carService.getCarById(carId),
          carService.getCarImages(carId)
        ]);

        setCar(carData);
        setImages(imageData);
      } catch (err) {
        console.error("Failed to load car:", err);
        setError(err instanceof Error ? err.message : "Failed to load car");
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading car details...</div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          {error || "Car not found"}
        </div>
        <Button label="Back to Cars" onClick={() => navigate("/cars")} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {getFeatureValue("brand")} {getFeatureValue("model")}
        </h1>
        <div className={styles.actions}>
          <Button label="Manage Images" color="secondary" onClick={() => navigate(`/cars/${car.carId}/images`)} />
          <Button label="Edit Car" color="secondary" onClick={() => navigate(`/cars/${car.carId}/edit`)} />
          <Button label="Delete Car" color="danger" onClick={handleDeleteCar} disabled={deleting} />
          <Button label="Back to Cars" onClick={() => navigate("/cars")} />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          {images.length > 0 ? (
            <div className={styles.imageGallery}>
              {images.map((image, index) => (
                <img
                  key={image.imageId}
                  src={image.fileUri}
                  alt={`${getFeatureValue("brand")} ${getFeatureValue("model")} - Image ${index + 1}`}
                  className={styles.carImage}
                />
              ))}
            </div>
          ) : (
            <div className={styles.noImages}>
              <p>No images available for this car</p>
            </div>
          )}
        </div>

        <div className={styles.detailsSection}>
          <h2>Car Details</h2>
          
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Car ID:</span>
              <span className={styles.value}>{car.carId}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.label}>Brand:</span>
              <span className={styles.value}>{getFeatureValue("brand")}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Model:</span>
              <span className={styles.value}>{getFeatureValue("model")}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Color:</span>
              <span className={styles.value}>{getFeatureValue("color")}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Fuel Type:</span>
              <span className={styles.value}>{getFeatureValue("fuelType")}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Status:</span>
              <span className={`${styles.value} ${styles.status} ${styles[getFeatureValue("status").toLowerCase()]}`}>
                {getFeatureValue("status")}
              </span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Price per day:</span>
              <span className={styles.value}>${car.price.toFixed(2)}</span>
            </div>
            

          </div>

          
        </div>
      </div>
    </div>
  );
};

export default CarViewPage;