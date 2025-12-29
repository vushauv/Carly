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
  
COMMIT;

SET unique_checks = 1;
SET foreign_key_checks = 1;
SET autocommit = 1;

SELECT * FROM Systems;
SELECT * FROM UserTypeDictionary;
SELECT * FROM Users;
SELECT * FROM LocationTypeDictionary;
SELECT * FROM Locations;

