import Navbar from "../Navbar/Navbar";
import styles from "./Header.module.css";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import Button from "../Button/Button";

import logo from "@/assets/icons/carly-logo.png";

const Header = () => {
  const { isLoggedIn, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>

        <Link to="/kpi" className={styles.homeLink}>
          <img
            src={logo}
            alt="Carly Logo"
            className={styles.logo}
          />
        </Link>

        {isLoggedIn ? (
          <Navbar>
            {/* NavBar of the app as a component - visible only when the user is logged in*/}
          </Navbar>
        ) : null}
        
        {/* Profile component with user info and logout */}
        {isLoggedIn ? (
          <div className={styles.profileSection}>
            <span className={styles.userEmail}>{user?.email}</span>
            <Button className={styles.logOutButton} label="Log Out" onClick={handleLogout}>Logout</Button>
          </div>
        ) : (
          <div className={styles.emptyDiv}/> 
        )}
      </div>
    </header>
  );
};

export default Header;
