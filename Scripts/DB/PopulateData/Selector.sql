USE backend;

-- Raw
SELECT * FROM Systems;

SELECT * FROM UserTypeDictionary;
SELECT * FROM Users;

SELECT * FROM LocationTypeDictionary;
SELECT * FROM Locations;

SELECT * FROM CarTypeDictionary;
SELECT * FROM FuelTypeDictionary;
SELECT * FROM TransmissionTypeDictionary;
SELECT * FROM DriveTypeDictionary;
SELECT * FROM CarStatusDictionary;
SELECT * FROM CarColorDictionary;

SELECT * FROM Brands;
SELECT * FROM Models;
SELECT * FROM ModelDetails;

SELECT * FROM Cars;
SELECT * FROM CarPrices;
SELECT * FROM CarImages;
SELECT * FROM CarLocations;
SELECT * FROM CarDetails;
SELECT * FROM CarStatuses;

-- Models resolved (brand + dictionaries)
SELECT
  m.ModelId,
  b.Name AS BrandName,
  m.Name AS ModelName,
  m.DisplayName AS ModelDisplayName,
  m.Version,
  ct.Name AS CarType,
  tt.Name AS Transmission,
  ft.Name AS Fuel,
  dt.Name AS Drive,
  m.IsEnabled,
  m.CreationTime,
  m.ModificationTime
FROM Models m
JOIN Brands b ON b.BrandId = m.BrandId
JOIN CarTypeDictionary ct ON ct.CarTypeDictionaryId = m.CarTypeDictionaryId
JOIN TransmissionTypeDictionary tt ON tt.TransmissionTypeDictionaryId = m.TransmissionTypeDictionaryId
JOIN FuelTypeDictionary ft ON ft.FuelTypeDictionaryId = m.FuelTypeDictionaryId
JOIN DriveTypeDictionary dt ON dt.DriveTypeDictionaryId = m.DriveTypeDictionaryId
ORDER BY b.Name, m.Name;

-- ModelDetails resolved (with model + brand)
SELECT
  md.ModelDetailId,
  md.ModelId,
  b.Name AS BrandName,
  m.Name AS ModelName,
  md.Generation,
  md.HorsePower,
  md.EngineDisplacement,
  md.FuelTankCapacity,
  md.EnergyStorageCapacity,
  md.DoorCount,
  md.SeatCount,
  md.IsEnabled,
  md.CreationTime,
  md.ModificationTime
FROM ModelDetails md
JOIN Models m ON m.ModelId = md.ModelId
JOIN Brands b ON b.BrandId = m.BrandId
ORDER BY b.Name, m.Name;

-- Cars resolved (model + brand + color)
SELECT
  c.CarId,
  b.Name AS BrandName,
  m.Name AS ModelName,
  col.Name AS ColorName,
  c.ProductionCountryId,
  c.IsEnabled,
  c.CreationTime,
  c.ModificationTime
FROM Cars c
JOIN Models m ON m.ModelId = c.ModelId
JOIN Brands b ON b.BrandId = m.BrandId
JOIN CarColorDictionary col ON col.CarColorDictionaryId = c.CarColorDictionaryId
ORDER BY b.Name, m.Name, c.CarId;

-- CarPrices resolved (car + model + brand)
SELECT
  cp.CarPriceId,
  cp.CarId,
  b.Name AS BrandName,
  m.Name AS ModelName,
  cp.ValidFrom,
  cp.ValidTo,
  cp.BasePriceDay,
  cp.BasePriceHour,
  cp.ExtensionPriceDay,
  cp.ExtensionPriceHour,
  cp.DelayPriceDay,
  cp.DelayPriceHour,
  cp.IsEnabled
FROM CarPrices cp
JOIN Cars c ON c.CarId = cp.CarId
JOIN Models m ON m.ModelId = c.ModelId
JOIN Brands b ON b.BrandId = m.BrandId
ORDER BY b.Name, m.Name, cp.ValidFrom;

-- CarImages resolved
SELECT
  ci.CarImageId,
  ci.CarId,
  b.Name AS BrandName,
  m.Name AS ModelName,
  ci.Path,
  ci.IsEnabled
FROM CarImages ci
JOIN Cars c ON c.CarId = ci.CarId
JOIN Models m ON m.ModelId = c.ModelId
JOIN Brands b ON b.BrandId = m.BrandId
ORDER BY b.Name, m.Name, ci.CarId, ci.CarImageId;

-- CarLocations resolved (car + model + brand + location)
SELECT
  cl.CarLocationId,
  cl.CarId,
  b.Name AS BrandName,
  m.Name AS ModelName,
  l.LocationId,
  l.LocationName,
  cl.IsEnabled
FROM CarLocations cl
JOIN Cars c ON c.CarId = cl.CarId
JOIN Models m ON m.ModelId = c.ModelId
JOIN Brands b ON b.BrandId = m.BrandId
JOIN Locations l ON l.LocationId = cl.LocationId
ORDER BY l.LocationName, b.Name, m.Name, cl.CarId;

- Models with resolved dictionary values + brand
SELECT
  m.ModelId,
  b.BrandId,
  b.Name AS BrandName,
  m.Name AS ModelName,
  m.DisplayName AS ModelDisplayName,
  m.Version,
  ct.CarTypeDictionaryId,
  ct.Name AS CarTypeName,
  tt.TransmissionTypeDictionaryId,
  tt.Name AS TransmissionName,
  ft.FuelTypeDictionaryId,
  ft.Name AS FuelTypeName,
  dt.DriveTypeDictionaryId,
  dt.Name AS DriveTypeName,
  m.IsEnabled,
  m.CreationTime,
  m.ModificationTime
FROM Models m
JOIN Brands b ON b.BrandId = m.BrandId
JOIN CarTypeDictionary ct ON ct.CarTypeDictionaryId = m.CarTypeDictionaryId
JOIN TransmissionTypeDictionary tt ON tt.TransmissionTypeDictionaryId = m.TransmissionTypeDictionaryId
JOIN FuelTypeDictionary ft ON ft.FuelTypeDictionaryId = m.FuelTypeDictionaryId
JOIN DriveTypeDictionary dt ON dt.DriveTypeDictionaryId = m.DriveTypeDictionaryId
ORDER BY b.Name, m.Name;

USE backend;

SELECT * FROM CarDetails;

SELECT * FROM CarStatuses;

-- Active (current) status per car
SELECT
  cs.CarId,
  cs.CarStatusId,
  cs.CarStatusDictionaryId,
  d.Name AS StatusName,
  d.DisplayName AS StatusDisplayName,
  cs.CreationTime,
  cs.ModificationTime,
  cs.IsEnabled
FROM CarStatuses cs
JOIN CarStatusDictionary d
  ON d.CarStatusDictionaryId = cs.CarStatusDictionaryId
WHERE cs.IsEnabled = 1
ORDER BY cs.CarId;

-- Full history per car (newest first)
SELECT
  cs.CarId,
  cs.CarStatusId,
  d.Name AS StatusName,
  cs.CreationTime,
  cs.ModificationTime,
  cs.IsEnabled
FROM CarStatuses cs
JOIN CarStatusDictionary d
  ON d.CarStatusDictionaryId = cs.CarStatusDictionaryId
ORDER BY cs.CarId, cs.CreationTime DESC, cs.CarStatusId DESC;


-- Cars with resolved model + brand + color
SELECT
  c.CarId,
  c.IsEnabled,
  c.CreationTime,
  c.ModificationTime,
  m.ModelId,
  b.Name AS BrandName,
  m.Name AS ModelName,
  m.DisplayName AS ModelDisplayName,
  col.CarColorDictionaryId,
  col.Name AS ColorName,
  col.DisplayName AS ColorDisplayName,
  c.ProductionCountryId
FROM Cars c
JOIN Models m ON m.ModelId = c.ModelId
JOIN Brands b ON b.BrandId = m.BrandId
JOIN CarColorDictionary col ON col.CarColorDictionaryId = c.CarColorDictionaryId
ORDER BY b.Name, m.Name, c.CarId;
