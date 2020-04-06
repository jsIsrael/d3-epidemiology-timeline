import * as React from "react";
import { ChangeEvent } from "react";

interface Props {
  checked: boolean;
  onChange: (event: ChangeEvent) => void;
  label: string;
}

const Checkbox = (props: Props) => {
  const { checked, onChange, label } = props;

  return (
    <>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
      <br />
    </>
  );
};

export default Checkbox;
