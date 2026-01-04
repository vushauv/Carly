/* <====== Remember to use correct path do the CSV folder! ======> */
USE backend;

SET GLOBAL local_infile = 1;
SET autocommit = 0;
SET foreign_key_checks = 0;
SET unique_checks = 0;


-- =========================
-- Systems
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/Systems.csv'
INTO TABLE Systems
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
-- UserTypeDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/UserTypeDictionary.csv'
INTO TABLE UserTypeDictionary
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
-- Users
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/Users.csv'
INTO TABLE Users
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(UserTypeDictionaryId, FirstName, LastName, Email)
SET
  SecondName = NULL,
  ContactNumber = NULL,
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;
 
-- =========================
-- LocationTypeDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/LocationTypeDictionary.csv'
INTO TABLE LocationTypeDictionary
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
-- Locations
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/Locations.csv'
INTO TABLE Locations
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(LocationName, Latitude, Longitude, LocationTypeDictionaryId)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- LicenceCategoryDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/LicenceCategoryDictionary.csv'
INTO TABLE LicenceCategoryDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, Description)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- Customers
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/Customers.csv'
INTO TABLE Customers
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(FirstName, SecondName, LastName, Pesel, Birthdate, ContactNumber, Email)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;

-- =========================
-- Licences
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/Licences.csv'
INTO TABLE Licences
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(CustomerId, LicenceCategoryDictionaryId, LicenceNumber, IssueDate, ValidFrom, ValidTo, IsValid)
SET
  CreationTime = NOW(),
  ModificationTime = NOW(),
  IsEnabled = 1;
  

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
  
  
-- =========================
-- BookingTypeDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/BookingTypeDictionary.csv'
INTO TABLE BookingTypeDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET CreationTime = NOW(), ModificationTime = NOW(), IsEnabled = 1;

-- =========================
-- DiscountTypeDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/DiscountTypeDictionary.csv'
INTO TABLE DiscountTypeDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET CreationTime = NOW(), ModificationTime = NOW(), IsEnabled = 1;

-- =========================
-- BookingStatusDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/BookingStatusDictionary.csv'
INTO TABLE BookingStatusDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET CreationTime = NOW(), ModificationTime = NOW(), IsEnabled = 1;


-- =========================
-- Bookings
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/Bookings.csv'
INTO TABLE Bookings
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(BookingTypeDictionaryId, SourceSystemId, ProviderSystemId, ProviderExternalBookingId, ProviderExternalItemId, CustomerId, CarId, DateFrom, DateTo, BasePrice, DiscountTypeDictionaryId, DiscountAmount, ActualPrice, IsPaid, IsEnabled)
SET CreationTime = NOW(), ModificationTime = NOW();

-- =========================
-- CarBookingDetails
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/CarBookingDetails.csv'
INTO TABLE CarBookingDetails
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(BookingId, PickupLocationId, ReturnLocationId, PickupActualTime, ReturnActualTime, IsEnabled)
SET CreationTime = NOW(), ModificationTime = NOW();

-- =========================
-- FlatBookingDetails
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/FlatBookingDetails.csv'
INTO TABLE FlatBookingDetails
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(BookingId, IsEnabled)
SET CreationTime = NOW(), ModificationTime = NOW();

-- =========================
-- CarFlatBookingLinks
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/CarFlatBookingLinks.csv'
INTO TABLE CarFlatBookingLinks
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(CarBookingId, FlatBookingId, IsEnabled)
SET CreationTime = NOW(), ModificationTime = NOW();

-- =========================
-- BookingStatuses
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/BookingStatuses.csv'
INTO TABLE BookingStatuses
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(BookingId, BookingStatusDictionaryId, CreationTime, ModificationTime, IsEnabled);


-- =========================
-- EmailStatusDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/EmailStatusDictionary.csv'
INTO TABLE EmailStatusDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET CreationTime = NOW(), ModificationTime = NOW(), IsEnabled = 1;


-- =========================
-- EmailTypeDictionary
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/EmailTypeDictionary.csv'
INTO TABLE EmailTypeDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET CreationTime = NOW(), ModificationTime = NOW(), IsEnabled = 1;

-- =========================
-- Emails
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/Emails.csv'
INTO TABLE Emails
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Email, Body, Subject, EmailTypeDictionaryId, IsEnabled)
SET CreationTime = NOW(), ModificationTime = NOW();

-- =========================
-- EmailCodes
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/EmailCodes.csv'
INTO TABLE EmailCodes
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(EmailId, Code, ExpiresAt, UsedAt, IsEnabled)
SET CreationTime = NOW(), ModificationTime = NOW();

-- =========================
-- EmailStatuses
-- =========================
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/EmailStatuses.csv'
INTO TABLE EmailStatuses
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(EmailId, EmailStatusDictionaryId, CreationTime, ModificationTime, IsEnabled);


COMMIT;

SET unique_checks = 1;
SET foreign_key_checks = 1;
SET autocommit = 1;