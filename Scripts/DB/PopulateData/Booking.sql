/* <====== Remember to use correct path do the CSV folder! ======> */
USE backend;
SET GLOBAL local_infile = 1;
SET autocommit = 0;
SET foreign_key_checks = 0;
SET unique_checks = 0;

-- Dictionaries
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/BookingTypeDictionary.csv'
INTO TABLE BookingTypeDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET CreationTime = NOW(), ModificationTime = NOW(), IsEnabled = 1;

LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/DiscountTypeDictionary.csv'
INTO TABLE DiscountTypeDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET CreationTime = NOW(), ModificationTime = NOW(), IsEnabled = 1;

LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/BookingStatusDictionary.csv'
INTO TABLE BookingStatusDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET CreationTime = NOW(), ModificationTime = NOW(), IsEnabled = 1;

-- Bookings
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/Bookings.csv'
INTO TABLE Bookings
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(BookingTypeDictionaryId, SourceSystemId, ProviderSystemId, ProviderExternalBookingId, ProviderExternalItemId, CustomerId, CarId, DateFrom, DateTo, BasePrice, DiscountTypeDictionaryId, DiscountAmount, ActualPrice, IsPaid, IsEnabled)
SET CreationTime = NOW(), ModificationTime = NOW();

-- CarBookingDetails (only for car bookings)
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/CarBookingDetails.csv'
INTO TABLE CarBookingDetails
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(BookingId, PickupLocationId, ReturnLocationId, PickupActualTime, ReturnActualTime, IsEnabled)
SET CreationTime = NOW(), ModificationTime = NOW();

-- FlatBookingDetails (only for flat bookings)
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/FlatBookingDetails.csv'
INTO TABLE FlatBookingDetails
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(BookingId, IsEnabled)
SET CreationTime = NOW(), ModificationTime = NOW();

-- Car-Flat links
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/CarFlatBookingLinks.csv'
INTO TABLE CarFlatBookingLinks
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(CarBookingId, FlatBookingId, IsEnabled)
SET CreationTime = NOW(), ModificationTime = NOW();

-- BookingStatuses (history)
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/BookingStatuses.csv'
INTO TABLE BookingStatuses
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(BookingId, BookingStatusDictionaryId, CreationTime, ModificationTime, IsEnabled);

COMMIT;

SET unique_checks = 1;
SET foreign_key_checks = 1;
SET autocommit = 1;

