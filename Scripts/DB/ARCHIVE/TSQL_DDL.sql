DECLARE @RunScript BIT;

SET @RunScript = 0; /* <======= Set to 1 to run the script */

IF @RunScript IS NULL or @RunScript = 0
	RETURN;

GO
CREATE SCHEMA [User]
GO
CREATE SCHEMA [Location]
GO
CREATE SCHEMA [Car]
GO
CREATE SCHEMA [Customer]
GO
CREATE SCHEMA [Booking]
GO
CREATE SCHEMA [Email]
GO
GO
CREATE SCHEMA [System]
GO

--TODO: we can move this to another schema
-- ===========================================================
--							'System' schema
-- ===========================================================
CREATE TABLE [System].[Systems] (
    [SystemId] SMALLINT PRIMARY KEY IDENTITY(1,1),
    [Name] VARCHAR(64) NOT NULL,
    [DisplayName] VARCHAR(64) NOT NULL,
    [Description] VARCHAR(1024) NULL,
    [CreationTime] DATETIME NOT NULL,
    [ModificationTime] DATETIME NOT NULL,
    [IsEnabled] BIT NOT NULL
);

-- ===========================================================
--							'User' schema
-- ===========================================================

/* we can have SuperAdmins, Admins, and system (ours and the other teams' )*/
CREATE TABLE [User].[UserTypeDictionary] (
	[UserTypeDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64), --Admin, SuperAdmin, Carly, Flatly, Parkingly (systems)
	[DisplayName] VARCHAR(64),
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

CREATE TABLE [User].[Users] (
	[UserId] INT PRIMARY KEY IDENTITY(1, 1),
	[UserTypeDictionaryId] SMALLINT NOT NULL FOREIGN KEY REFERENCES [User].UserTypeDictionary(UserTypeDictionaryId),
	[FirstName] NVARCHAR(64) NOT NULL,
	[SecondName] NVARCHAR(64) NULL,
	[LastName] NVARCHAR(128) NOT NULL,
	[ContactNumber] BIGINT NULL,
	[Email] VARCHAR(256) NOT NULL, /* TODO: maybe drop not null for Flatly, Parkingly */
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL, 
	[IsEnabled] BIT NOT NULL
);
/* ensures uniqueness of email on active users */
CREATE UNIQUE INDEX UX_Users_Email_Active
ON [User].[Users] (Email)
WHERE IsEnabled = 1;

-- ===========================================================
--							'Location' schema
-- ===========================================================
/* dealership, parking, mechanic, (country) etc */
CREATE TABLE [Location].[LocationTypeDictionary] (
	[LocationTypeDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64) NOT NULL,
	[DisplayName] VARCHAR(64) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

CREATE TABLE [Location].[Locations] (
	[LocationId] INT PRIMARY KEY IDENTITY(1, 1),
	[LocationName] VARCHAR(128) NOT NULL,
	[Latitude] DECIMAL(8, 6) NOT NULL,
	[Longitude] DECIMAL(9, 6) NOT NULL,
	[LocationTypeDictionaryId] SMALLINT NOT NULL FOREIGN KEY REFERENCES Location.LocationTypeDictionary(LocationTypeDictionaryId),
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

-- ===========================================================
--							'Car' schema
-- ===========================================================

/* SUV, sedan, pick-up, etc */
CREATE TABLE [Car].[CarTypeDictionary] (
	[CarTypeDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64) NOT NULL,
	[DisplayName] VARCHAR(64) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

/* Diesel, gasoline, electric, hybrid, etc. */
CREATE TABLE [Car].[FuelTypeDictionary] (
	[FuelTypeDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64) NOT NULL,
	[DisplayName] VARCHAR(64) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

/* manual, automatic, etc. */
CREATE TABLE [Car].[TransmissionTypeDictionary] (
	[TransmissionTypeDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64) NOT NULL,
	[DisplayName] VARCHAR(64) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

/* front, back, awd etc. */
CREATE TABLE [Car].[DriveTypeDictionary] (
	[DriveTypeDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64) NOT NULL,
	[DisplayName] VARCHAR(64) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

CREATE TABLE [Car].[CarStatusDictionary] (
	[CarStatusDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64) NOT NULL,
	[DisplayName] VARCHAR(64) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[IsAvailable] BIT NOT NULL, /* TODO: flag that informs us about whether the car can be booked - maybe a better name needed */
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

CREATE TABLE [Car].[Brands] (
	[BrandId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(128) NOT NULL,
	[DisplayName] VARCHAR(128) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
	/* TODO: we can add country, HQ, founding year, etc */
);

/* 911, RS Q8, Civic etc*/
CREATE TABLE [Car].[Models] (
	[ModelId] INT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(256) NOT NULL,
	[DisplayName] VARCHAR(256) NOT NULL,
	[BrandId] SMALLINT NOT NULL FOREIGN KEY REFERENCES Car.Brands(BrandId),
	[Version] VARCHAR(512) NULL, 
	[CarTypeDictionaryId] SMALLINT NOT NULL FOREIGN KEY REFERENCES Car.CarTypeDictionary(CarTypeDictionaryId),
	[TransmissionTypeDictionaryId] SMALLINT NOT NULL FOREIGN KEY REFERENCES Car.TransmissionTypeDictionary(TransmissionTypeDictionaryId),
	[FuelTypeDictionaryId] SMALLINT NOT NULL FOREIGN KEY REFERENCES Car.FuelTypeDictionary(FuelTypeDictionaryId),
	[DriveTypeDictionaryId] SMALLINT NOT NULL FOREIGN KEY REFERENCES Car.DriveTypeDictionary(DriveTypeDictionaryId),
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

CREATE TABLE [Car].[ModelDetails] (
	[ModelDetailId] INT PRIMARY KEY IDENTITY(1, 1),
	[ModelId] INT FOREIGN KEY REFERENCES Car.Models(ModelId),
	[Generation] VARCHAR(512) NULL,
	[HorsePower] SMALLINT NOT NULL,
	[EngineDisplacement] INT NOT NULL, /* cm^3 */
	[FuelTankCapacity] INT NULL, /* liters */
	[EnergyStorageCapacity] DECIMAL(6, 2) NULL, /* (kWh) max <=> 9999.99 */
	[DoorCount] TINYINT NOT NULL,
	[SeatCount] TINYINT NOT NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL

);

/* TODO: might be overkill, but cars can name their colors differently, so we might wanna distinguish 'Basaltblackmetallic' 'black Mythos' etc */
CREATE TABLE [Car].[CarColorDictionary] (
	[CarColorDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64) NOT NULL,
	[DisplayName] VARCHAR(64) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

/* 
availability will be calcualted dynamically, depending on the given dates, statuses etc
we can add some more general info not specific for a CarModel, like production country, where it was bought from and when etc.	
*/
CREATE TABLE [Car].[Cars] (
	[CarId] INT PRIMARY KEY IDENTITY(1, 1),
	[ModelId] INT NOT NULL FOREIGN KEY REFERENCES Car.Models(ModelId),
	[CarColorDictionaryId] SMALLINT NOT NULL FOREIGN KEY REFERENCES Car.CarColorDictionary(CarColorDictionaryId),
	[ProductionCountryId] SMALLINT, /* TODO: do we wanna keep countries in a seperate table? */
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

CREATE TABLE [Car].[CarLocations] (
	[CarLocationId] INT PRIMARY KEY IDENTITY(1, 1),
	[CarId] INT NOT NULL FOREIGN KEY REFERENCES Car.Cars(CarId),
	[LocationId] INT NOT NULL FOREIGN KEY REFERENCES Location.Locations(LocationId),
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

/* we will store images as paths on a disk or as links */
CREATE TABLE [Car].[CarImages] (
	[CarImageId] INT PRIMARY KEY IDENTITY(1, 1),
	[CarId] INT NOT NULL FOREIGN KEY REFERENCES Car.Cars(CarId),
	[Path] VARCHAR(256) NOT NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

/* 
Through this architecture, we can predefine car prices
based on [ValidFrom] and [ValidTo] dates
TODO: Do we wanna add defaults on the extensionprice, delayprice etc
*/
CREATE TABLE [Car].[CarPrices] (
	[CarPriceId] INT PRIMARY KEY IDENTITY(1, 1),
	[CarId] INT NOT NULL FOREIGN KEY REFERENCES Car.Cars(CarId),
	[ValidFrom] DATETIME NOT NULL, 
	[ValidTo] DATETIME NOT NULL,
	[BasePriceDay] MONEY NOT NULL,
	[BasePriceHour] MONEY NOT NULL,
	[ExtensionPriceDay] MONEY NULL,
	[ExtensionPriceHour] MONEY NULL,
	[DelayPriceDay] MONEY NULL,
	[DelayPriceHour] MONEY NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

CREATE TABLE [Car].[CarDetails] (
	[CarDetailId] INT PRIMARY KEY IDENTITY(1, 1),
	[CarId] INT NOT NULL FOREIGN KEY REFERENCES Car.Cars(CarId),
	[BookingCount] INT NOT NULL DEFAULT(0),
	[AccidentCount] TINYINT NOT NULL DEFAULT(0),
	[AverageRating] DECIMAL(3, 2) NULL
	/* TODO: if u think of any more stats, we can add them here */
);

CREATE TABLE [Car].[CarStatuses] (
	[CarStatusId] INT PRIMARY KEY IDENTITY(1, 1),
	[CarId] INT NOT NULL FOREIGN KEY REFERENCES Car.Cars(CarId),
	[CarStatusDictionaryId] SMALLINT NOT NULL FOREIGN KEY REFERENCES Car.CarStatusDictionary(CarStatusDictionaryId),
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

-- ===========================================================
--							'Customer' schema
-- ===========================================================
/* TODO: Decide what details we wanna store about customers: address, nationality etc. */

CREATE TABLE [Customer].[Customers] (
	[CustomerId] INT PRIMARY KEY IDENTITY(1, 1),
	[FirstName] NVARCHAR(64) NOT NULL,
	[SecondName] NVARCHAR(64) NULL,
	[LastName] NVARCHAR(128) NOT NULL,
	[Pesel] VARCHAR(11) NULL,
	[Birthdate] DATE,
	[ContactNumber] BIGINT NOT NULL,
	[Email] VARCHAR(256) NOT NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);
/* ensures email uniqueness as long as the record is active [IsEnabled] = 1 */
CREATE UNIQUE INDEX UX_Customers_Email_Active
ON [Customer].[Customers] (Email)
WHERE IsEnabled = 1;


CREATE TABLE [Customer].[LicenceCategoryDictionary] (
	[LicenceCategoryDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(32) NOT NULL, /* B, C, B + E */
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

CREATE TABLE [Customer].[Licences] (
	[CustomerLicenceId] INT PRIMARY KEY IDENTITY(1, 1),
	[CustomerId] INT NOT NULL FOREIGN KEY REFERENCES Customer.Customers(CustomerId),
	[LicenceCategoryDictionaryId] SMALLINT NOT NULL FOREIGN KEY REFERENCES Customer.LicenceCategoryDictionary(LicenceCategoryDictionaryId),
	[LicenceNumber] VARCHAR(32) NOT NULL,
	[IssueDate] DATE NOT NULL, /* we might want to enforce miniumum number of years of experience */
	[ValidFrom] DATE NOT NULL, 
	[ValidTo] DATE NOT NULL,
	[IsValid] BIT NOT NULL, /* we can add dynamically calculating IsValid based on ValidFrom:ValidTo dates */
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

-- ===========================================================
--							'Booking' schema
-- ===========================================================

/* new, cancelled, extended, delayed etc. */
CREATE TABLE [Booking].[BookingStatusDictionary] (
	[BookingStatusDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64) NOT NULL,
	[DisplayName] VARCHAR(64) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL, 
	[IsEnabled] BIT NOT NULL
);



/* flat amount, percentage or to a given amount etc */
CREATE TABLE [Booking].[DiscountTypeDictionary] (
	[DiscountTypeDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64) NOT NULL,
	[DisplayName] VARCHAR(64) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

/* Car / Flat booking*/
CREATE TABLE [Booking].[BookingTypeDictionary] (
	[BookingTypeDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64) NOT NULL,
	[DisplayName] VARCHAR(64) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

/* TODO: match datatypes to the other systems, better name for ConnectedBookingId */
/*
1) Car booking from Flatly:
	[BookingTypeDictionaryId] = 1 (Car)
	[SourceSystemId] = 2 (Parkly)
	[ProviderSystemId] = 2 (Parkly)
2) Flat booking from Carly:
	[BookingTypeDictionaryId] = 2 (Flat)
	[SourceSystemId] = 1 (Carly)
	[ProviderSystemId] = 3 (Flatly)
3) Car booking from Carly:
	[BookingTypeDictionaryId] = 1 (Car)
	[SourceSystemId] = 1 (Carly)
	[ProviderSystemId] = 1 (Carly)
*/
CREATE TABLE [Booking].[Bookings] (
	[BookingId] INT PRIMARY KEY IDENTITY(1, 1),
	[BookingTypeDictionaryId] SMALLINT NOT NULL FOREIGN KEY REFERENCES Booking.BookingTypeDictionary(BookingTypeDictionaryId), /*TODO: Default for Carly (id TBD) */
	[SourceSystemId] SMALLINT NOT NULL FOREIGN KEY REFERENCES System.Systems(SystemId), /* Who made the booking: Carly / Parkly */
	[ProviderSystemId] SMALLINT NOT NULL FOREIGN KEY REFERENCES System.Systems(SystemId), /* Where are CRUD operations done: Carly / Parkly / Flatly*/
	[ProviderExternalBookingId] BIGINT NULL, /* their PK that will be used for all CRUD operations */ 
	[ProviderExternalItemId] BIGINT NULL, /* TODO: we can keep the FlatId, ParkingId etc if we want to (or store their corresponding CustomerId) */
	[CustomerId] INT FOREIGN KEY REFERENCES Customer.Customers(CustomerId),
	[CarId] INT FOREIGN KEY REFERENCES Car.Cars(CarId),
	[DateFrom] DATETIME NOT NULL,
	[DateTo] DATETIME NOT NULL,
	[BasePrice] MONEY NULL, /* calculated based on the duration and the price of the car / flat */
	[DiscountTypeDictionaryId] SMALLINT FOREIGN KEY REFERENCES Booking.DiscountTypeDictionary(DiscountTypeDictionaryId),
	[DiscountAmount] DECIMAL(10, 2) NULL,
	[ActualPrice] MONEY NULL, /* can be calculated on UPDATE, where we check the DiscountType and Amount */
	[IsPaid] BIT NOT NULL DEFAULT(0),
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

/* allows 0 to many relation between a car booking and flat bookings */
CREATE TABLE [Booking].[CarFlatBookingLinks] (
    [CarBookingId] INT NOT NULL FOREIGN KEY REFERENCES Booking.Bookings(BookingId),
    [FlatBookingId] INT NOT NULL FOREIGN KEY REFERENCES Booking.Bookings(BookingId),
    [CreationTime] DATETIME NOT NULL,
    [ModificationTime] DATETIME NOT NULL,
    [IsEnabled] BIT NOT NULL,
	
	CONSTRAINT [PK_CarFlatBookingLinks]
        PRIMARY KEY ([CarBookingId], [FlatBookingId])
);
/* ensures 1 flat booking cannot be related to many car bookings */
CREATE UNIQUE INDEX [UX_CarFlatLinks_FlatBooking]
ON [Booking].[CarFlatBookingLinks]([FlatBookingId])
WHERE [IsEnabled] = 1;

CREATE TABLE [Booking].[CarBookingDetails] (
	[BookingId] INT NOT NULL FOREIGN KEY REFERENCES Booking.Bookings(BookingId),
	[PickupLocationId] INT NOT NULL FOREIGN KEY REFERENCES Location.Locations(LocationId),
	[ReturnLocationId] INT NOT NULL FOREIGN KEY REFERENCES Location.Locations(LocationId),
	[PickupActualTime] DATETIME NULL,
	[ReturnActualTime] DATETIME NULL, 
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);
ALTER TABLE [Booking].[CarBookingDetails]
ADD CONSTRAINT [PK_CarBookingDetails] PRIMARY KEY ([BookingId]);

CREATE TABLE [Booking].[FlatBookingDetails] (
	[BookingId] INT NOT NULL FOREIGN KEY REFERENCES Booking.Bookings(BookingId),
	
	/*TODO: store here all columns that we decide on and that correspond to Flatly's implementation */
	
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
	/*TODO: maybe add some more columns for Flat details, like images, statuses etc (TBD) */
);
ALTER TABLE [Booking].[FlatBookingDetails]
ADD CONSTRAINT [PK_FlatBookingDetails] PRIMARY KEY ([BookingId]);

CREATE TABLE [Booking].[BookingStatuses] (
	[BookingStatusId] INT PRIMARY KEY IDENTITY(1, 1),
	[BookingId] INT NOT NULL FOREIGN KEY REFERENCES Booking.Bookings(BookingId),
	[BookingStatusDictionaryId] SMALLINT NOT NULL FOREIGN KEY REFERENCES Booking.BookingStatusDictionary(BookingStatusDictionaryId),
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

-- ===========================================================
--							'Email' schema
-- ===========================================================

/* new, sent, error etc */
CREATE TABLE [Email].[EmailStatusDictionary] (
	[EmailStatusDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64) NOT NULL,
	[DisplayName] VARCHAR(64) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

/* sign-in, verification, informative etc. */
CREATE TABLE [Email].[EmailTypeDictionary] (
	[EmailTypeDictionaryId] SMALLINT PRIMARY KEY IDENTITY(1, 1),
	[Name] VARCHAR(64) NOT NULL,
	[DisplayName] VARCHAR(64) NOT NULL,
	[Description] VARCHAR(1024) NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

 /*TODO: do we wanna store the code in a seperate column if its already in the [Body] (decide datatype too) */
CREATE TABLE [Email].[Emails] (
	[EmailId] BIGINT PRIMARY KEY IDENTITY(1, 1),
	[Email] VARCHAR(256) NOT NULL, /* adresat */
	[Body] VARCHAR(MAX) NOT NULL,
	[Subject] VARCHAR(256) NOT NULL,
	[EmailTypeDictionaryId] SMALLINT FOREIGN KEY REFERENCES Email.EmailTypeDictionary(EmailTypeDictionaryId),
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

CREATE TABLE [Email].[EmailCodes] (
	[EmailCodeId] BIGINT PRIMARY KEY IDENTITY(1, 1),
	[EmailId] BIGINT FOREIGN KEY REFERENCES Email.Emails(EmailId),
	[Code] NVARCHAR(256) NOT NULL,
	[ExpiresAt] DATETIME NOT NULL,
	[UsedAt] DATETIME NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

--Optional
CREATE TABLE [Email].[Attachments] (
	[AttachmentId] BIGINT PRIMARY KEY IDENTITY(1, 1),
	[EmailId] BIGINT FOREIGN KEY REFERENCES Email.Emails(EmailId),
	[Path] VARCHAR(256) NOT NULL,
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);

CREATE TABLE [Email].[EmailStatuses] (
	[EmailStatusId] BIGINT PRIMARY KEY IDENTITY(1, 1),
	[EmailId] BIGINT FOREIGN KEY REFERENCES Email.Emails(EmailId),
	[EmailStatusDictionaryId] SMALLINT FOREIGN KEY REFERENCES Email.EmailStatusDictionary(EmailStatusDictionaryId),
	[CreationTime] DATETIME NOT NULL,
	[ModificationTime] DATETIME NOT NULL,
	[IsEnabled] BIT NOT NULL
);
