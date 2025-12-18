import styles from "./Navbar.module.css";
import NavbarButton from "../NavbarButton/NavbarButton";
import { useState } from "react";

type NavKey = "kpi" | "manage_bookings" | "user_list" | "manage_cars" | "partner_bookings";

const navItems: { key: NavKey; label:string }[] = [
  { key: "kpi", label: "KPI" },
  { key: "manage_bookings", label: "Manage Bookings" },
  { key: "user_list", label: "User List" },
  { key: "manage_cars", label: "Manage Cars" },
  { key: "partner_bookings", label: "Partner Bookings" },
];

const Navbar = () => {
  const [activePage, setActivePage] = useState<NavKey>("kpi");
  return (
    <nav className={styles.navbar}> 
    {navItems.map((item) => (
      <NavbarButton
        key={item.key}
        isActive={activePage === item.key}
        onClick={() => setActivePage(item.key)}
      >
        {item.label}
      </NavbarButton>
    ))}
  </nav>);
};

export default Navbar;
