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
    <>
      <input
        min={15}
        max={50}
        value={graphDense}
        onChange={handleDenseChange}
        className={styles.denseInput}
      />
      <br />
      Change Graph Dense
    </>
  );
};

export default DenseInput;
