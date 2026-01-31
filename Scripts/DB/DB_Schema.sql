CREATE SCHEMA IF NOT EXISTS backend DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE backend;

-- ===========================================================
--                       User
-- ===========================================================
/*
1 - Customer
2 - System
3 - SuperAdmin
4 - Admin
*/
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
  Password VARCHAR(128) NULL, /* todo: remove if not needed finally */
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (UserId),
  CONSTRAINT FK_Users_UserTypeDictionary
    FOREIGN KEY (UserTypeDictionaryId)
    REFERENCES UserTypeDictionary (UserTypeDictionaryId)
) ENGINE=InnoDB;

-- unique on (Email, IsEnabled)
CREATE UNIQUE INDEX UX_Users_Email_Active
ON Users (Email, IsEnabled);

-- ===========================================================
--                       Location
-- ===========================================================

CREATE TABLE Locations (
  LocationId INT NOT NULL AUTO_INCREMENT,
  LocationName VARCHAR(128) NOT NULL,
  Latitude DECIMAL(8,6) NULL,
  Longitude DECIMAL(9,6) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (LocationId),
) ENGINE=InnoDB;

-- ===========================================================
--                       Car
-- ===========================================================

CREATE TABLE CarToFeatureLinks (
	CarToFeatureLinkId INT NOT NULL AUTO_INCREMENT,
	CarId INT NOT NULL, --FK to Cars
	CarFeatureId INT NOT NULL, --FK to CarFeatures
	CreationTime DATETIME NOT NULL,
    ModificationTime DATETIME NOT NULL,
    IsEnabled BOOLEAN NOT NULL
	PRIMARY KEY (CarToFeatureLinkId)
);

CREATE TABLE CarFeatures (
  CarFeatureId INT AUTO_INCREMENT,
  CarFeatureDictionaryId INT NOT NULL,
  Value DECIMAL(19,4) NULL,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarTypeDictionaryId)
) ENGINE=InnoDB;

/* color, transmission, car type, drive type, brand, model */
CREATE TABLE CarFeatureDictionary (
  CarFeatureDictionaryId SMALLINT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(64) NOT NULL,
  DisplayName VARCHAR(64) NOT NULL,
  Description VARCHAR(1024) NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarTypeDictionaryId)
) ENGINE=InnoDB;

CREATE TABLE Cars (
  CarId INT NOT NULL AUTO_INCREMENT,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarId)
) ENGINE=InnoDB;

CREATE TABLE CarImages (
  CarImageId INT NOT NULL AUTO_INCREMENT,
  CarId INT NOT NULL,
  URL VARCHAR(256) NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (CarImageId),
  CONSTRAINT FK_CarImages_Cars
    FOREIGN KEY (CarId) REFERENCES Cars (CarId)
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

CREATE TABLE Bookings (
  BookingId INT NOT NULL AUTO_INCREMENT,
  UserId INT NOT NULL, /* If made from our system, User with UserTypeId=Customer, else => Id of the system (Parkly)*/
  ProviderExternalBookingId BIGINT NULL, /* PK in Flatly */
  FlatBookingStatusId INT NULL,
  CarId INT NULL,
  CarBookingStatusId INT,
  
  CarBookingDateFrom DATETIME NOT NULL,
  CarBookingDateTo DATETIME NOT NULL,
  PickupLocationId INT NOT NULL,
  ReturnLocationId INT NOT NULL,
  CreationTime DATETIME NOT NULL,
  ModificationTime DATETIME NOT NULL,
  IsEnabled BOOLEAN NOT NULL,
  PRIMARY KEY (BookingId),
  CONSTRAINT FK_Bookings_Cars
    FOREIGN KEY (CarId) REFERENCES Cars (CarId)
) ENGINE=InnoDB;


