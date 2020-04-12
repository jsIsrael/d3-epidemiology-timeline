import * as React from "react";
import styles from "./denseInput.module.css";

interface Props {
  graphDense: number;
  setGraphDense: (value: number) => void;
}

const DenseInput = (props: Props) => {
  const { graphDense, setGraphDense } = props;

  const handleDenseChange = (e: any) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setGraphDense(value);
    }
  };

  return (
    <div className={styles.denseInputContainer}>
      <input
        type="range"
        min={5}
        max={50}
        step={5}
        value={graphDense}
        onChange={handleDenseChange}
        className={styles.denseInput}
      />
      Change Tree Dense
    </div>
  );
};

export default DenseInput;
