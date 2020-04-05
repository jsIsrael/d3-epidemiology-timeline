import * as React from "react";
import { List } from "react-virtualized";

const MenuList = (props: any) => {
  const rows = props.children;
  // @ts-ignore
  const rowRenderer = ({ key, index, isScrolling, isVisible, style }) => {
    // @ts-ignore
    const elm = rows[index];
    return (
      <div key={key} style={style}>
        {elm}
      </div>
    );
  };

  return (
    <List
      style={{ width: "100%", textAlign: "right" }}
      width={300}
      height={300}
      rowHeight={30}
      rowCount={rows && rows.length ? rows.length : 0}
      rowRenderer={rowRenderer}
    />
  );
};

export default MenuList;
