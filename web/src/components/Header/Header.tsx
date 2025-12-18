import Navbar from "../Navbar/Navbar";
import styles from "./Header.module.css";

export interface HeaderProps {
  loggedIn: boolean;
}

const Header = ({ loggedIn }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <a href="/" className={styles.homeLink}>
          <img
            src="/src/assets/icons/carly-logo.png"
            alt="Carly Logo"
            className={styles.logo}
          ></img>
        </a>
        {loggedIn ? (
          <Navbar>
            {/* NavBar of the app as a component - visible only when the user is logged in*/}
          </Navbar>
        ) : null}
        {/* Profile compoennt as a dropdown list using which the user can view profile and log in/out*/}
        <div className={styles.emptyDiv}/> {/* Empty div to balance the grid layout (for navbar to be centered)*. to be changed for a profile component later on*/}
      </div>
    </header>
  );
};

export default Header;
