/* <====== Remember to use correct path do the CSV folder! ======> */
USE backend;
SET GLOBAL local_infile = 1;
SET autocommit = 0;
SET foreign_key_checks = 0;
SET unique_checks = 0;

-- Dictionaries
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/EmailStatusDictionary.csv'
INTO TABLE EmailStatusDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET CreationTime = NOW(), ModificationTime = NOW(), IsEnabled = 1;

LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/EmailTypeDictionary.csv'
INTO TABLE EmailTypeDictionary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Name, DisplayName, Description)
SET CreationTime = NOW(), ModificationTime = NOW(), IsEnabled = 1;

-- Emails
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/Emails.csv'
INTO TABLE Emails
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(Email, Body, Subject, EmailTypeDictionaryId, IsEnabled)
SET CreationTime = NOW(), ModificationTime = NOW();

-- EmailCodes
LOAD DATA LOCAL INFILE 'C:/Carly/FinalProjectCarly/Scripts/DB/CSV/EmailCodes.csv'
INTO TABLE EmailCodes
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(EmailId, Code, ExpiresAt, UsedAt, IsEnabled)
SET CreationTime = NOW(), ModificationTime = NOW();

-- EmailStatuses (history)
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
