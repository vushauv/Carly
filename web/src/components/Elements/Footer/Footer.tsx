import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>{new Date().getFullYear()} Carly - Don't Contact Us</p>
    </footer>
  );
};

export default Footer;
