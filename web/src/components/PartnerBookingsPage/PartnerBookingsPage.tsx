import { useState } from "react";
import Button from "../Elements/Button/Button";
import CarBookings from "./CarBookings";
import FlatlyBookings from "./FlatlyBookings";
import styles from "./PartnerBookingsPage.module.css";

type Mode = "car" | "flat";

const PartnerBookingsPage = () => {
  const [mode, setMode] = useState<Mode>("car");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Partner bookings</h1>

      <div className={styles.topActions}>
        <div>
        <Button  label="Parkly" onClick={() => setMode("car")} disabled={mode === "car"}>
        </Button>

        <Button label="Flatly" onClick={() => setMode("flat")} disabled={mode === "flat"}>
        </Button>
        </div>
      </div>

      {mode === "car" ? <CarBookings /> : <FlatlyBookings />}
    </div>
  );
};

export default PartnerBookingsPage;
