import { useState } from "react";
import Button from "../Elements/Button/Button";
import CarBookings from "./CarBookings";
import FlatBookings from "./FlatBookings";
import styles from "./PartnerBookingsPage.module.css";

type Mode = "car" | "flat";

const PartnerBookingsPage = () => {
  const [mode, setMode] = useState<Mode>("car");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Partner bookings</h1>

      <div className={styles.topActions}>
        <Button onClick={() => setMode("car")} disabled={mode === "car"}>
          Car bookings
        </Button>

        <Button onClick={() => setMode("flat")} disabled={mode === "flat"}>
          Flat bookings
        </Button>
      </div>

      {mode === "car" ? <CarBookings /> : <FlatBookings />}
    </div>
  );
};

export default PartnerBookingsPage;
