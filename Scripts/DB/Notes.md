# Project Scripts Overview

I took the liberty of creating a directory for all non-code-related matters:  
`/Scripts`

I also added the mockups and project requirements, as I found myself using them a lot so its gonna be convenient to have them - we can always get rid of them later.


---

## Database Scripts

In the /Scripts/DB dir you will find a .sql (one for now) file with the DDL script for creating the database tables.

**Don't run it for now**, as we first need to agree on the DB structure (deleting or renaming tables/columns with so many FK's is a hassle). Additionally, the script is written in **T-SQL** (#uck microsoft but im used to their dialect),  we will have to rewrite it to the **MySQL dialect**.

---

## Diagrams and Mockups

In the `/Scripts/PNG` directory, you will find `.png` files representing the most important schemas:
- Booking  
- Car  
- Customer  
- Email  

Because there are many foreign keys defined in the tables, I was not able to create a clean diagram for the Booking schema, but it should still be understandable.

---

## TODOs and Notes

In the `Scripts/DB/DDL/TSQL_DDL.sql` script, you will find a lot of TODO's scattered around the code.these were the points
where something wasn't clear to me or required later attention - I recommend **Ctrl + F'ing** through them all.

---

## Questions

If you have any questions or comments, please **DO** hesitate to contact me.
