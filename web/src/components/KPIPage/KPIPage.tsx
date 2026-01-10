import { useEffect, useMemo, useState } from "react";
import FilterBar from "../FilterBar/FilterBar";
import styles from "./KPIPage.module.css";

type KPI = { label: string; value: number };

type Booking = {
    id: string;
    car: string;
    from: string; // "YYYY-MM-DD"
    to: string;   // "YYYY-MM-DD"
    user: string;
    status: "Pending" | "Confirmed" | "Canceled";
};

// Fake "backend" data (placeholders for now)
const fakeKpis: KPI[] = [
    { label: "Active cars", value: 128 },
    { label: "Upcoming bookings", value: 42 },
    { label: "Partner bookings", value: 17 },
];

const fakeBookingResults: Booking[] = [
    {
        id: "b1",
        car: "Toyota Yaris",
        from: "2025-01-12",
        to: "2025-01-16",
        user: "John Smith",
        status: "Confirmed",
    },
    {
        id: "b2",
        car: "BMW 3 Series",
        from: "2025-02-03",
        to: "2025-02-04",
        user: "Anna Nowak",
        status: "Pending",
    },
    {
        id: "b3",
        car: "Audi A4",
        from: "2025-02-10",
        to: "2025-02-14",
        user: "Maria Lee",
        status: "Confirmed",
    },
];

const KPIPage = () => {
    //all initialized with empty values and populated on first load
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // "Fetch" on first load (future: replace with real API calls)
    useEffect(() => {
        setKpis(fakeKpis);
        setAllBookings(fakeBookingResults);
        setFilteredBookings(fakeBookingResults); // show all by default (in the future maybe not such a good idea)
    }, []);

    const dateRangeIsValid = useMemo(() => {//actually no need to useMemo here (cheap operation), but why not
        if (!startDate || !endDate) return false;
        return startDate <= endDate; //string comparison works or YYYY-MM-DD format
    }, [startDate, endDate]);

    const applyFilters = () => {
        if (!dateRangeIsValid) {
            alert("Please select a valid date range."); //to be changed in the future probably (good for now)
            return;
        }

        const results = allBookings.filter((b) => {
            // for now i did it so that it checks if start date is within booking range (to be discussed how it should work exactly)
            return b.from >= startDate && b.from <= endDate;
        });

        setFilteredBookings(results);
    };

    const resetFilters = () => {
        setStartDate("");
        setEndDate("");
        setFilteredBookings(allBookings);//to be changed in the future probably (good for now)
    };

    const formatDate = (arg: string) => { //i just wanted the dates to be displayed as DD.MM.YYYY
        const [y, m, d] = arg.split("-");
        return `${d}.${m}.${y}`;
    };


    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Key Performance Indicators</h1>

            <div className={styles.kpiGrid}>
                {kpis.map((k) => (
                    <div key={k.label} className={styles.kpiCard}>
                        <span className={styles.kpiLabel}>{k.label}</span>
                        <span className={styles.kpiValue}>{k.value}</span>
                    </div>
                ))}
            </div>

            <h3 className={styles.subTitle}>Search criteria</h3>

            <FilterBar onApply={applyFilters} onReset={resetFilters}>
                <div className={styles.filters}>
                    <label className={styles.field}>
                        <span className={styles.label}>Start date</span>
                        <input
                            className={styles.input}
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>End date</span>
                        <input
                            className={styles.input}
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </label>


                </div>
            </FilterBar>

            <h3 className={styles.subTitle}>Matching bookings</h3>

            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <span>Car</span>
                    <span>From</span>
                    <span>To</span>
                    <span>User</span>
                    <span>Status</span>
                </div>

                {filteredBookings.map((b) => (
                    <div key={b.id} className={styles.tableRow}>
                        <span className={styles.car}>{b.car}</span>
                        <span>{formatDate(b.from)}</span>
                        <span>{formatDate(b.to)}</span>
                        <span>{b.user}</span>
                        <span className={styles.status}>{b.status}</span>
                    </div>
                ))}
            </div>


            {filteredBookings.length === 0 ? (
                <p className={styles.empty}>No bookings match the selected date range.</p>
            ) : null}
        </div>
    );
};

export default KPIPage;
