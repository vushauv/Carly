import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./CarViewPage.module.css";
import type { Car, CarImage } from "../ManageCarsPage/types";
import { carService } from "../ManageCarsPage/carService";
import Button from "../Button/Button";

const CarViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [images, setImages] = useState<CarImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get car feature value by name
  const getFeatureValue = (featureName: string): string => {
    return car?.carFeatures.find(f => f.name === featureName)?.value || "N/A";
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
          <Button label="Edit Car" onClick={() => navigate(`/cars/${car.carId}/edit`)} />
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
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Car ID:</span>
              <span className={styles.value}>{car.carId}</span>
            </div>
          </div>

          {car.carFeatures.length > 0 && (
            <div className={styles.featuresSection}>
              <h3>All Features</h3>
              <div className={styles.featuresList}>
                {car.carFeatures.map((feature) => (
                  <div key={feature.dictionaryId} className={styles.featureItem}>
                    <span className={styles.featureName}>{feature.name}:</span>
                    <span className={styles.featureValue}>{feature.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarViewPage;