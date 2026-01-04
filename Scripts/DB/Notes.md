# Test data

I took the libery of creating a quite useful script for seeding the data in all tables in the current version of the Database (TBD),
it is quite complex but might even be useful during 'deployment' - it will be extremely easy to populate all 'static' data in our project,
such as Booking statuses, Email types, Car types etc.
Below you will find instructions for executing it, feel free to extend, modify and do whatever you want to the scripts and test data.
If you have any questions, DO hestiate to contact me - contact our Team Lead Chat GPT first.

---

## Instructions for executing the script:

**(1)** Run MySQL Workbench as Administrator

**(2)** On a specific MySQL Connection of your choice (probably Local instance), do the following:
- Right click -> Edit connection -> Advanced
- In 'Others:' section, add this line: OPT_LOCAL_INFILE=1
This along with the Administrator mode allows to use the functionality of loading the records into the tables  
based on the .csv files in a specified location

**(3)** Run `\Scripts\DB\DDL\MySQL-DDL.sql`  
Disclaimer: make sure to drop all existing tables beforehand: if you're using the same connection as the one on the labs,  
there will already be a table Users, so just make sure to drop all tables in schema 'backend' before executing!

**(4)** Run `/Scripts/DB/PopulateData/PopulateAll.sql`  
It's **VERY IMPORTANT** to input the correct path to the folder containing .csv files, in the scripts mine is  
`C:/Carly/FinalProjectCarly/Scripts/DB/CSV/`, so make sure you change it everywhere or the script wont't work!!!

**(5)** In case of errors, execute `\Scripts\DB\DDL\Cleanup.sql` - this safely removes all tables created by the DDL script

**(6)** (Optional) If you want, there are dedicated scripts for specific 'schemas', so you can play around with the data  
- Drop given tables (using Cleanup.sql - it's easier to drop than delete data since there are autoincrementing PK's)  
- Modify a given .csv file (or multiple)  
- Run the related portion of the script to insert the new data

Disclaimer: there are a lot of Foreign Keys, so it may be simpler to simply drop all tables, modify one file,  
and populate all tables again, the script is very quick.

**(7)** In `\Scripts\DB\PopulateData\Selector.sql`, you will find selects for all populated tables, along with resolved ones  
Disclaimer: Chat generated some of the .csv files to simulate status history etc, I haven't gone thoroughly through all the data, it more about the concept anyway

---

## Comments

### Scripts directory
I took the liberty of creating a directory for all non-code-related matters - `/Scripts`

### Mockups and requirements
I also added the mockups and project requirements, as I found myself using them a lot so its gonna be convenient to have them - we can always get rid of them later.

### Schema diagrams
In the `Scripts/PNG` you will find the `.png` files of the most important schemas: Booking, Car, Customer, Email  
Since there are a lot of FK's defined in the tables, I couldn't nicely create the diagram of the Booking schema, but I think you will manage.

### TSQL DDL notes
In the `Scripts/DB/DDL/TSQL_DDL.sql` script you will find a lot of TODO's scattered around the code, these were the points where something wasn't clear to me or required later attention - I recommend Ctrl + F'ing through them all.

---

## TODOs and Notes

In the `Scripts/DB/DDL/TSQL_DDL.sql` script, you will find a lot of TODO's scattered around the code.these were the points
where something wasn't clear to me or required later attention - I recommend **Ctrl + F'ing** through them all.

---

## TODO
- Briefly describe intentions for unclear tables (status history, etc)
- Go through the TODO's in initial TSQL DDL script
