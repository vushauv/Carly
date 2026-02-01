import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./CarImagesPage.module.css";
import type { Car, CarImage } from "../../ManageCarsPage/types";
import { carService } from "../../ManageCarsPage/carService";
import Button from "../../Button/Button";

const CarImagesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [car, setCar] = useState<Car | null>(null);
  const [images, setImages] = useState<CarImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Helper function to get car feature value by name
  const getFeatureValue = (featureName: string): string => {
    return car?.carFeatures.find(f => f.name === featureName)?.value || "N/A";
  };

  const loadCarAndImages = async () => {
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

  useEffect(() => {
    loadCarAndImages();
  }, [id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !car) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = Array.from(files).map(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }

        return carService.uploadCarImage(car.carId, file);
      });

      await Promise.all(uploadPromises);
      
      // Reload images after successful upload
      const updatedImages = await carService.getCarImages(car.carId);
      setImages(updatedImages);
      
      // Reset file input
      event.target.value = '';
    } catch (err) {
      console.error("Failed to upload images:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!car) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this image?");
    if (!confirmDelete) return;

    try {
      await carService.deleteCarImage(car.carId, imageId);
      
      // Reload images after deletion
      const updatedImages = await carService.getCarImages(car.carId);
      setImages(updatedImages);
    } catch (err) {
      console.error("Failed to delete image:", err);
      setError(err instanceof Error ? err.message : "Failed to delete image");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading car images...</div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          {error || "Car not found"}
        </div>
        <Button label="Back to Car" onClick={() => navigate(`/cars/${id}`)} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Manage Images - {getFeatureValue("brand")} {getFeatureValue("model")}
        </h1>
        <div className={styles.actions}>
          <Button label="Back to Car" onClick={() => navigate(`/cars/${id}`)} />
        </div>
      </div>

      <div className={styles.uploadSection}>
        <h2>Upload New Images</h2>
        <div className={styles.uploadArea}>
          <input
            type="file"
            id="imageUpload"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className={styles.fileInput}
          />
          <label htmlFor="imageUpload" className={styles.uploadLabel}>
            {uploading ? "Uploading..." : "Choose Images to Upload"}
          </label>
          <p className={styles.uploadHint}>
            Select one or more images (JPEG, PNG, GIF). Maximum 5MB per file.
          </p>
        </div>
        
        {uploadError && (
          <div className={styles.error}>
            {uploadError}
          </div>
        )}
      </div>

      <div className={styles.imagesSection}>
        <h2>Current Images ({images.length})</h2>
        
        {images.length > 0 ? (
          <div className={styles.imageGrid}>
            {images.map((image, index) => (
              <div key={image.imageId} className={styles.imageCard}>
                <div className={styles.imageContainer}>
                  <img
                    src={image.fileUri}
                    alt={`${getFeatureValue("brand")} ${getFeatureValue("model")} - Image ${index + 1}`}
                    className={styles.carImage}
                  />
                  <div className={styles.imageOverlay}>
                    <Button
                      label="Delete"
                      color="danger"
                      onClick={() => handleDeleteImage(image.imageId)}
                    />
                  </div>
                </div>
                <div className={styles.imageInfo}>
                  <p className={styles.imageDetails}>
                    <strong>Size:</strong> {(image.fileSize / 1024).toFixed(1)} KB
                  </p>
                  <p className={styles.imageDetails}>
                    <strong>Type:</strong> {image.fileType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noImages}>
            <p>No images uploaded for this car yet.</p>
            <p>Use the upload section above to add images.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarImagesPage;