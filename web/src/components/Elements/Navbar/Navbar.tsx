import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import NavbarButton from "../NavbarButton/NavbarButton";

type NavKey =
  | "kpi"
  | "manage_bookings"
  | "user_list"
  | "manage_cars"
  | "partner_bookings";

const navItems: { key: NavKey; label: string; to: string }[] = [
  // { key: "kpi", label: "KPI", to: "/kpi" },
  { key: "manage_bookings", label: "Manage Bookings", to: "/manage-bookings" },
  { key: "user_list", label: "User List", to: "/users" },
  { key: "manage_cars", label: "Manage Cars", to: "/cars" },
  { key: "partner_bookings", label: "Partner Bookings", to: "/partner-bookings" },
];

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      {navItems.map((item) => (
        <NavLink
          key={item.key}
          to={item.to}
          // (optional) avoids "KPI" being active for "/kpi/anything"
          end={item.to === "/kpi" || item.to === "/cars" || item.to === "/users"}
          className={styles.navLink} // style the link wrapper if needed
        >
          {({ isActive }: { isActive: boolean }) => (
            <NavbarButton isActive={isActive}>
              {item.label}
            </NavbarButton>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
