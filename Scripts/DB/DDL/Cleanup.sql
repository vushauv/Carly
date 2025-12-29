USE backend;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================
-- Email
-- =========================
DROP TABLE IF EXISTS EmailStatuses;
DROP TABLE IF EXISTS Attachments;
DROP TABLE IF EXISTS EmailCodes;
DROP TABLE IF EXISTS Emails;
DROP TABLE IF EXISTS EmailTypeDictionary;
DROP TABLE IF EXISTS EmailStatusDictionary;

-- =========================
-- Booking
-- =========================
DROP TABLE IF EXISTS BookingStatuses;
DROP TABLE IF EXISTS FlatBookingDetails;
DROP TABLE IF EXISTS CarBookingDetails;
DROP TABLE IF EXISTS CarFlatBookingLinks;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS BookingTypeDictionary;
DROP TABLE IF EXISTS DiscountTypeDictionary;
DROP TABLE IF EXISTS BookingStatusDictionary;

-- =========================
-- Customer
-- =========================
DROP TABLE IF EXISTS Licences;
DROP TABLE IF EXISTS LicenceCategoryDictionary;
DROP TABLE IF EXISTS Customers;

-- =========================
-- Car
-- =========================
DROP TABLE IF EXISTS CarStatuses;
DROP TABLE IF EXISTS CarDetails;
DROP TABLE IF EXISTS CarPrices;
DROP TABLE IF EXISTS CarImages;
DROP TABLE IF EXISTS CarLocations;
DROP TABLE IF EXISTS Cars;
DROP TABLE IF EXISTS CarColorDictionary;
DROP TABLE IF EXISTS ModelDetails;
DROP TABLE IF EXISTS Models;
DROP TABLE IF EXISTS Brands;
DROP TABLE IF EXISTS CarStatusDictionary;
DROP TABLE IF EXISTS DriveTypeDictionary;
DROP TABLE IF EXISTS TransmissionTypeDictionary;
DROP TABLE IF EXISTS FuelTypeDictionary;
DROP TABLE IF EXISTS CarTypeDictionary;

-- =========================
-- Location
-- =========================
DROP TABLE IF EXISTS Locations;
DROP TABLE IF EXISTS LocationTypeDictionary;

-- =========================
-- User
-- =========================
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS UserTypeDictionary;

-- =========================
-- System
-- =========================
DROP TABLE IF EXISTS Systems;
