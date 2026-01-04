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


SELECT * FROM LicenceCategoryDictionary;
SELECT * FROM Customers;
SELECT * FROM Licences;

SELECT * FROM BookingTypeDictionary;
SELECT * FROM DiscountTypeDictionary;
SELECT * FROM BookingStatusDictionary;

SELECT * FROM Bookings;
SELECT * FROM CarBookingDetails;
SELECT * FROM FlatBookingDetails;
SELECT * FROM CarFlatBookingLinks;
SELECT * FROM BookingStatuses;

SELECT * FROM EmailStatusDictionary;
SELECT * FROM EmailTypeDictionary;
SELECT * FROM Emails;
SELECT * FROM EmailCodes;
SELECT * FROM EmailStatuses;

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

-- Models with resolved dictionary values + brand
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


-- Customers with licences resolved
SELECT
  c.CustomerId,
  c.FirstName,
  c.SecondName,
  c.LastName,
  c.Pesel,
  c.Birthdate,
  c.ContactNumber,
  c.Email,
  c.IsEnabled,
  l.CustomerLicenceId,
  lcd.LicenceCategoryDictionaryId,
  lcd.Name AS LicenceCategory,
  l.LicenceNumber,
  l.IssueDate,
  l.ValidFrom,
  l.ValidTo,
  l.IsValid AS LicenceIsValid,
  l.IsEnabled AS LicenceIsEnabled
FROM Customers c
LEFT JOIN Licences l
  ON l.CustomerId = c.CustomerId
LEFT JOIN LicenceCategoryDictionary lcd
  ON lcd.LicenceCategoryDictionaryId = l.LicenceCategoryDictionaryId
ORDER BY c.CustomerId, l.CustomerLicenceId;



-- Bookings resolved (type + systems + customer + car)
SELECT
  b.BookingId,
  btd.Name AS BookingType,
  ss.Name AS SourceSystem,
  ps.Name AS ProviderSystem,
  b.ProviderExternalBookingId,
  b.ProviderExternalItemId,
  b.CustomerId,
  c.Email AS CustomerEmail,
  b.CarId,
  b.DateFrom,
  b.DateTo,
  b.BasePrice,
  dtd.Name AS DiscountType,
  b.DiscountAmount,
  b.ActualPrice,
  b.IsPaid,
  b.IsEnabled
FROM Bookings b
JOIN BookingTypeDictionary btd ON btd.BookingTypeDictionaryId = b.BookingTypeDictionaryId
JOIN Systems ss ON ss.SystemId = b.SourceSystemId
JOIN Systems ps ON ps.SystemId = b.ProviderSystemId
LEFT JOIN Customers c ON c.CustomerId = b.CustomerId
LEFT JOIN DiscountTypeDictionary dtd ON dtd.DiscountTypeDictionaryId = b.DiscountTypeDictionaryId
ORDER BY b.BookingId;

-- Current status per booking
SELECT
  bs.BookingId,
  d.Name AS StatusName,
  d.DisplayName AS StatusDisplayName,
  bs.CreationTime,
  bs.ModificationTime
FROM BookingStatuses bs
JOIN BookingStatusDictionary d ON d.BookingStatusDictionaryId = bs.BookingStatusDictionaryId
WHERE bs.IsEnabled = 1
ORDER BY bs.BookingId;

-- Car-Flat link view
SELECT
  l.CarBookingId,
  l.FlatBookingId,
  car.SourceSystemId AS CarSourceSystemId,
  flat.ProviderSystemId AS FlatProviderSystemId,
  car.CarId,
  car.CustomerId
FROM CarFlatBookingLinks l
JOIN Bookings car ON car.BookingId = l.CarBookingId
JOIN Bookings flat ON flat.BookingId = l.FlatBookingId
WHERE l.IsEnabled = 1;

-- Emails resolved with type
SELECT
  e.EmailId,
  e.Email,
  etd.Name AS EmailType,
  e.Subject,
  e.IsEnabled,
  e.CreationTime,
  e.ModificationTime
FROM Emails e
LEFT JOIN EmailTypeDictionary etd
  ON etd.EmailTypeDictionaryId = e.EmailTypeDictionaryId
ORDER BY e.EmailId;

-- Current status per email
SELECT
  es.EmailId,
  es.EmailStatusId,
  d.Name AS StatusName,
  d.DisplayName AS StatusDisplayName,
  es.CreationTime,
  es.ModificationTime
FROM EmailStatuses es
JOIN EmailStatusDictionary d
  ON d.EmailStatusDictionaryId = es.EmailStatusDictionaryId
WHERE es.IsEnabled = 1
ORDER BY es.EmailId;

-- Codes with email target
SELECT
  c.EmailCodeId,
  c.EmailId,
  e.Email AS RecipientEmail,
  c.Code,
  c.ExpiresAt,
  c.UsedAt,
  c.IsEnabled
FROM EmailCodes c
LEFT JOIN Emails e
  ON e.EmailId = c.EmailId
ORDER BY c.EmailId, c.EmailCodeId;