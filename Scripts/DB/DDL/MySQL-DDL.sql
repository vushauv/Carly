CREATE SCHEMA IF NOT EXISTS backend DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE backend;

-- ===========================================================
--                       System
-- ===========================================================
CREATE TABLE Systems (
  SystemId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (SystemId)
) ENGINE=InnoDB;

-- ===========================================================
--                       User
-- ===========================================================
CREATE TABLE UserTypeDictionary (
  UserTypeDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (UserTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE Users (
  UserId INT NOT NULL AUTO_INCREMENT,
  UserTypeDictionaryId SMALLINT NOT NULL,
  FirstName VARCHAR(64) NOT NULL,
  SecondName VARCHAR(64) NULL,
  LastName VARCHAR(128) NOT NULL,
  ContactNumber BIGINT NULL,
  Email VARCHAR(256) NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (UserId),
  CONSTRAINT FK_Users_UserTypeDictionary
    FOREIGN KEY (UserTypeDictionaryId)
    REFERENCES UserTypeDictionary (UserTypeDictionaryId)
) ENGINE=InnoDB;

-- Filtered unique index (SQL Server) -> MySQL workaround: unique on (Email, IsEnabled)
CREATE UNIQUE INDEX UX_Users_Email_Active
ON Users (Email, IsEnabled);

-- ===========================================================
--                       Location
-- ===========================================================
CREATE TABLE LocationTypeDictionary (
  LocationTypeDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (LocationTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE Locations (
  LocationId INT NOT NULL AUTO_INCREMENT,
  LocationName VARCHAR(128) NOT NULL,
  Latitude DECIMAL(8,6) NOT NULL,
  Longitude DECIMAL(9,6) NOT NULL,
  LocationTypeDictionaryId SMALLINT NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (LocationId),
  CONSTRAINT FK_Locations_LocationTypeDictionary
    FOREIGN KEY (LocationTypeDictionaryId)
    REFERENCES LocationTypeDictionary (LocationTypeDictionaryId)
) ENGINE=InnoDB;

-- ===========================================================
--                       Car
-- ===========================================================
CREATE TABLE CarTypeDictionary (
  CarTypeDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE FuelTypeDictionary (
  FuelTypeDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (FuelTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE TransmissionTypeDictionary (
  TransmissionTypeDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (TransmissionTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE DriveTypeDictionary (
  DriveTypeDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (DriveTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE CarStatusDictionary (
  CarStatusDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  IsAvailable BOOLEAN NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarStatusDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE Brands (
  BrandId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(128) NOT NULL,
  DisplayName VARCHAR(128) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (BrandId)
) ENGINE=InnoDB;

CREATE TABLE Models (
  ModelId INT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(256) NOT NULL,
  DisplayName VARCHAR(256) NOT NULL,
  BrandId SMALLINT NOT NULL,
  Version VARCHAR(512) NULL,
  CarTypeDictionaryId SMALLINT NOT NULL,
  TransmissionTypeDictionaryId SMALLINT NOT NULL,
  FuelTypeDictionaryId SMALLINT NOT NULL,
  DriveTypeDictionaryId SMALLINT NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (ModelId),
  CONSTRAINT FK_Models_Brands
    FOREIGN KEY (BrandId) REFERENCES Brands (BrandId),
  CONSTRAINT FK_Models_CarTypeDictionary
    FOREIGN KEY (CarTypeDictionaryId) REFERENCES CarTypeDictionary (CarTypeDictionaryId),
  CONSTRAINT FK_Models_TransmissionTypeDictionary
    FOREIGN KEY (TransmissionTypeDictionaryId) REFERENCES TransmissionTypeDictionary (TransmissionTypeDictionaryId),
  CONSTRAINT FK_Models_FuelTypeDictionary
    FOREIGN KEY (FuelTypeDictionaryId) REFERENCES FuelTypeDictionary (FuelTypeDictionaryId),
  CONSTRAINT FK_Models_DriveTypeDictionary
    FOREIGN KEY (DriveTypeDictionaryId) REFERENCES DriveTypeDictionary (DriveTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE ModelDetails (
  ModelDetailId INT NOT NULL AUTO_INCREMENT,
  ModelId INT NULL,
  Generation VARCHAR(512) NULL,
  HorsePower SMALLINT NOT NULL,
  EngineDisplacement INT NOT NULL,
  FuelTankCapacity INT NULL,
  EnergyStorageCapacity DECIMAL(6,2) NULL,
  DoorCount TINYINT NOT NULL,
  SeatCount TINYINT NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (ModelDetailId),
  CONSTRAINT FK_ModelDetails_Models
    FOREIGN KEY (ModelId) REFERENCES Models (ModelId)
) ENGINE=InnoDB;

CREATE TABLE CarColorDictionary (
  CarColorDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarColorDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE Cars (
  CarId INT NOT NULL AUTO_INCREMENT,
  ModelId INT NOT NULL,
  CarColorDictionaryId SMALLINT NOT NULL,
  ProductionCountryId SMALLINT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarId),
  CONSTRAINT FK_Cars_Models
    FOREIGN KEY (ModelId) REFERENCES Models (ModelId),
  CONSTRAINT FK_Cars_CarColorDictionary
    FOREIGN KEY (CarColorDictionaryId) REFERENCES CarColorDictionary (CarColorDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE CarLocations (
  CarLocationId INT NOT NULL AUTO_INCREMENT,
  CarId INT NOT NULL,
  LocationId INT NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarLocationId),
  CONSTRAINT FK_CarLocations_Cars
    FOREIGN KEY (CarId) REFERENCES Cars (CarId),
  CONSTRAINT FK_CarLocations_Locations
    FOREIGN KEY (LocationId) REFERENCES Locations (LocationId)
) ENGINE=InnoDB;

CREATE TABLE CarImages (
  CarImageId INT NOT NULL AUTO_INCREMENT,
  CarId INT NOT NULL,
  Path VARCHAR(256) NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarImageId),
  CONSTRAINT FK_CarImages_Cars
    FOREIGN KEY (CarId) REFERENCES Cars (CarId)
) ENGINE=InnoDB;

-- MONEY -> DECIMAL(19,4) in MySQL
CREATE TABLE CarPrices (
  CarPriceId INT NOT NULL AUTO_INCREMENT,
  CarId INT NOT NULL,
  ValidFrom DATETIME NOT NULL,
  ValidTo DATETIME NOT NULL,
  BasePriceDay DECIMAL(19,4) NOT NULL,
  BasePriceHour DECIMAL(19,4) NOT NULL,
  ExtensionPriceDay DECIMAL(19,4) NULL,
  ExtensionPriceHour DECIMAL(19,4) NULL,
  DelayPriceDay DECIMAL(19,4) NULL,
  DelayPriceHour DECIMAL(19,4) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarPriceId),
  CONSTRAINT FK_CarPrices_Cars
    FOREIGN KEY (CarId) REFERENCES Cars (CarId)
) ENGINE=InnoDB;

CREATE TABLE CarDetails (
  CarDetailId INT NOT NULL AUTO_INCREMENT,
  CarId INT NOT NULL,
  BookingCount INT NOT NULL DEFAULT 0,
  AccidentCount TINYINT NOT NULL DEFAULT 0,
  AverageRating DECIMAL(3,2) NULL,
  PRIMARY KEY (CarDetailId),
  CONSTRAINT FK_CarDetails_Cars
    FOREIGN KEY (CarId) REFERENCES Cars (CarId)
) ENGINE=InnoDB;

CREATE TABLE CarStatuses (
  CarStatusId INT NOT NULL AUTO_INCREMENT,
  CarId INT NOT NULL,
  CarStatusDictionaryId SMALLINT NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarStatusId),
  CONSTRAINT FK_CarStatuses_Cars
    FOREIGN KEY (CarId) REFERENCES Cars (CarId),
  CONSTRAINT FK_CarStatuses_CarStatusDictionary
    FOREIGN KEY (CarStatusDictionaryId) REFERENCES CarStatusDictionary (CarStatusDictionaryId)
) ENGINE=InnoDB;

-- ===========================================================
--                       Customer
-- ===========================================================
CREATE TABLE Customers (
  CustomerId INT NOT NULL AUTO_INCREMENT,
  FirstName VARCHAR(64) NOT NULL,
  SecondName VARCHAR(64) NULL,
  LastName VARCHAR(128) NOT NULL,
  Pesel VARCHAR(11) NULL,
  Birthdate DATE NULL,
  ContactNumber BIGINT NOT NULL,
  Email VARCHAR(256) NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CustomerId)
) ENGINE=InnoDB;

-- Filtered unique index (SQL Server) -> MySQL workaround: unique on (Email, IsEnabled)
CREATE UNIQUE INDEX UX_Customers_Email_Active
ON Customers (Email, IsEnabled);

CREATE TABLE LicenceCategoryDictionary (
  LicenceCategoryDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(32) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (LicenceCategoryDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE Licences (
  CustomerLicenceId INT NOT NULL AUTO_INCREMENT,
  CustomerId INT NOT NULL,
  LicenceCategoryDictionaryId SMALLINT NOT NULL,
  LicenceNumber VARCHAR(32) NOT NULL,
  IssueDate DATE NOT NULL,
  ValidFrom DATE NOT NULL,
  ValidTo DATE NOT NULL,
  IsValid BOOLEAN NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CustomerLicenceId),
  CONSTRAINT FK_Licences_Customers
    FOREIGN KEY (CustomerId) REFERENCES Customers (CustomerId),
  CONSTRAINT FK_Licences_LicenceCategoryDictionary
    FOREIGN KEY (LicenceCategoryDictionaryId) REFERENCES LicenceCategoryDictionary (LicenceCategoryDictionaryId)
) ENGINE=InnoDB;

-- ===========================================================
--                       Booking
-- ===========================================================
CREATE TABLE BookingStatusDictionary (
  BookingStatusDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (BookingStatusDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE DiscountTypeDictionary (
  DiscountTypeDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (DiscountTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE BookingTypeDictionary (
  BookingTypeDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (BookingTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE Bookings (
  BookingId INT NOT NULL AUTO_INCREMENT,
  BookingTypeDictionaryId SMALLINT NOT NULL,
  SourceSystemId SMALLINT NOT NULL,
  ProviderSystemId SMALLINT NOT NULL,
  ProviderExternalBookingId BIGINT NULL,
  ProviderExternalItemId BIGINT NULL,
  CustomerId INT NULL,
  CarId INT NULL,
  DateFrom DATETIME NOT NULL,
  DateTo DATETIME NOT NULL,
  BasePrice DECIMAL(19,4) NULL,
  DiscountTypeDictionaryId SMALLINT NULL,
  DiscountAmount DECIMAL(10,2) NULL,
  ActualPrice DECIMAL(19,4) NULL,
  IsPaid BOOLEAN NOT NULL DEFAULT 0,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (BookingId),
  CONSTRAINT FK_Bookings_BookingTypeDictionary
    FOREIGN KEY (BookingTypeDictionaryId) REFERENCES BookingTypeDictionary (BookingTypeDictionaryId),
  CONSTRAINT FK_Bookings_SourceSystem
    FOREIGN KEY (SourceSystemId) REFERENCES Systems (SystemId),
  CONSTRAINT FK_Bookings_ProviderSystem
    FOREIGN KEY (ProviderSystemId) REFERENCES Systems (SystemId),
  CONSTRAINT FK_Bookings_Customers
    FOREIGN KEY (CustomerId) REFERENCES Customers (CustomerId),
  CONSTRAINT FK_Bookings_Cars
    FOREIGN KEY (CarId) REFERENCES Cars (CarId),
  CONSTRAINT FK_Bookings_DiscountTypeDictionary
    FOREIGN KEY (DiscountTypeDictionaryId) REFERENCES DiscountTypeDictionary (DiscountTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE CarFlatBookingLinks (
  CarBookingId INT NOT NULL,
  FlatBookingId INT NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarBookingId, FlatBookingId),
  CONSTRAINT FK_CarFlatBookingLinks_CarBooking
    FOREIGN KEY (CarBookingId) REFERENCES Bookings (BookingId),
  CONSTRAINT FK_CarFlatBookingLinks_FlatBooking
    FOREIGN KEY (FlatBookingId) REFERENCES Bookings (BookingId)
) ENGINE=InnoDB;

-- Filtered unique index (SQL Server) -> MySQL workaround: unique on (FlatBookingId, IsEnabled)
CREATE UNIQUE INDEX UX_CarFlatLinks_FlatBooking
ON CarFlatBookingLinks (FlatBookingId, IsEnabled);

CREATE TABLE CarBookingDetails (
  BookingId INT NOT NULL,
  PickupLocationId INT NOT NULL,
  ReturnLocationId INT NOT NULL,
  PickupActualTime DATETIME NULL,
  ReturnActualTime DATETIME NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (BookingId),
  CONSTRAINT FK_CarBookingDetails_Bookings
    FOREIGN KEY (BookingId) REFERENCES Bookings (BookingId),
  CONSTRAINT FK_CarBookingDetails_PickupLocation
    FOREIGN KEY (PickupLocationId) REFERENCES Locations (LocationId),
  CONSTRAINT FK_CarBookingDetails_ReturnLocation
    FOREIGN KEY (ReturnLocationId) REFERENCES Locations (LocationId)
) ENGINE=InnoDB;

CREATE TABLE FlatBookingDetails (
  BookingId INT NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (BookingId),
  CONSTRAINT FK_FlatBookingDetails_Bookings
    FOREIGN KEY (BookingId) REFERENCES Bookings (BookingId)
) ENGINE=InnoDB;

CREATE TABLE BookingStatuses (
  BookingStatusId INT NOT NULL AUTO_INCREMENT,
  BookingId INT NOT NULL,
  BookingStatusDictionaryId SMALLINT NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (BookingStatusId),
  CONSTRAINT FK_BookingStatuses_Bookings
    FOREIGN KEY (BookingId) REFERENCES Bookings (BookingId),
  CONSTRAINT FK_BookingStatuses_BookingStatusDictionary
    FOREIGN KEY (BookingStatusDictionaryId) REFERENCES BookingStatusDictionary (BookingStatusDictionaryId)
) ENGINE=InnoDB;

-- ===========================================================
--                       Email
-- ===========================================================
CREATE TABLE EmailStatusDictionary (
  EmailStatusDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (EmailStatusDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE EmailTypeDictionary (
  EmailTypeDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (EmailTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE Emails (
  EmailId BIGINT NOT NULL AUTO_INCREMENT,
  Email VARCHAR(256) NOT NULL,
  Body LONGTEXT NOT NULL,
  Subject VARCHAR(256) NOT NULL,
  EmailTypeDictionaryId SMALLINT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (EmailId),
  CONSTRAINT FK_Emails_EmailTypeDictionary
    FOREIGN KEY (EmailTypeDictionaryId) REFERENCES EmailTypeDictionary (EmailTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE EmailCodes (
  EmailCodeId BIGINT NOT NULL AUTO_INCREMENT,
  EmailId BIGINT NULL,
  Code VARCHAR(256) NOT NULL,
  ExpiresAt DATETIME NOT NULL,
  UsedAt DATETIME NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (EmailCodeId),
  CONSTRAINT FK_EmailCodes_Emails
    FOREIGN KEY (EmailId) REFERENCES Emails (EmailId)
) ENGINE=InnoDB;

CREATE TABLE Attachments (
  AttachmentId BIGINT NOT NULL AUTO_INCREMENT,
  EmailId BIGINT NULL,
  Path VARCHAR(256) NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (AttachmentId),
  CONSTRAINT FK_Attachments_Emails
    FOREIGN KEY (EmailId) REFERENCES Emails (EmailId)
) ENGINE=InnoDB;

CREATE TABLE EmailStatuses (
  EmailStatusId BIGINT NOT NULL AUTO_INCREMENT,
  EmailId BIGINT NULL,
  EmailStatusDictionaryId SMALLINT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (EmailStatusId),
  CONSTRAINT FK_EmailStatuses_Emails
    FOREIGN KEY (EmailId) REFERENCES Emails (EmailId),
  CONSTRAINT FK_EmailStatuses_EmailStatusDictionary
    FOREIGN KEY (EmailStatusDictionaryId) REFERENCES EmailStatusDictionary (EmailStatusDictionaryId)
) ENGINE=InnoDB;
