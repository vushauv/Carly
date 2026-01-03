/* <====== Remember to use correct path do the CSV folder! ======> */
USE backend;
SET GLOBAL local_infile = 1;
SET autocommit = 0;
SET foreign_key_checks = 0;
SET unique_checks = 0;

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

COMMIT;

SET unique_checks = 1;
SET foreign_key_checks = 1;
SET autocommit = 1;
