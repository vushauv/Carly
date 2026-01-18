import Button from "../Button/Button";
import styles from "./AddNewEntityComponent.module.css";

type AddNewEntityProps = {
  title: string;
  buttonText: string;
  onButtonClick: () => void;
};

const AddNewEntityComponent = ({ title, buttonText, onButtonClick }: AddNewEntityProps) => {
  return (
    <div className={styles.addNewEntityRow}>
      <h3 className={styles.subTitle}>{title}</h3>

      <div className={styles.topActions}>
        <Button onClick={onButtonClick}>{buttonText}</Button>
      </div>
    </div>
  );
};

export default AddNewEntityComponent;
