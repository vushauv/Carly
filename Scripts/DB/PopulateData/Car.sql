/* <====== Remember to use correct path do the CSV folder! ======> */
USE backend;
SET GLOBAL local_infile = 1;
SET autocommit = 0;
SET foreign_key_checks = 0;
SET unique_checks = 0;

-- =========================
-- CarTypeDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/CarTypeDictionary.csv'
INTO TABLE CarTypeDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- FuelTypeDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/FuelTypeDictionary.csv'
INTO TABLE FuelTypeDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- TransmissionTypeDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/TransmissionTypeDictionary.csv'
INTO TABLE TransmissionTypeDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- DriveTypeDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/DriveTypeDictionary.csv'
INTO TABLE DriveTypeDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- CarStatusDictionary (has IsAvailable)
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/CarStatusDictionary.csv'
INTO TABLE CarStatusDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description, IsAvailable)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- CarColorDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/CarColorDictionary.csv'
INTO TABLE CarColorDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- Brands
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/Brands.csv'
INTO TABLE Brands
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- Models
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/Models.csv'
INTO TABLE Models
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, BrandId, Version, CarTypeDictionaryId, TransmissionTypeDictionaryId, FuelTypeDictionaryId, DriveTypeDictionaryId)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- ModelDetails
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/ModelDetails.csv'
INTO TABLE ModelDetails
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(ModelId, Generation, HorsePower, EngineDisplacement, FuelTankCapacity, EnergyStorageCapacity, DoorCount, SeatCount)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;
  
-- =========================
-- Cars
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/Cars.csv'
INTO TABLE Cars
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(ModelId, CarColorDictionaryId)
SET
  ProductionCountryId = NULL,
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;
  
-- =========================================================
-- CarDetails
-- =========================================================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/CarDetails.csv'
INTO TABLE CarDetails
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(CarId, BookingCount, AccidentCount, AverageRating);

-- =========================================================
-- CarStatuses
-- =========================================================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/CarStatuses.csv'
INTO TABLE CarStatuses
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(CarId, CarStatusDictionaryId, CreationTime, ModificationTime, IsEnabled);

-- =========================
-- CarPrices
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/CarPrices.csv'
INTO TABLE CarPrices
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(CarId, ValidFrom, ValidTo, BasePriceDay, BasePriceHour, ExtensionPriceDay, ExtensionPriceHour, DelayPriceDay, DelayPriceHour)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- CarImages
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/CarImages.csv'
INTO TABLE CarImages
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(CarId, Path)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- CarLocations
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/CarLocations.csv'
INTO TABLE CarLocations
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(CarId, LocationId)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

COMMIT;

SET unique_checks = 1;
SET foreign_key_checks = 1;
SET autocommit = 1;
