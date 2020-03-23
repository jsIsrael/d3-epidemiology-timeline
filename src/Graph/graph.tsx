import * as React from "react";
// import { runD3Stuff } from "./runD3Stuff";
import { runD3StuffSecondIteration } from "./secondIterationD3";
import { Event } from "./data2ndIteration";
import { CaseNode } from "../listToGraph/interfaces";

interface Props {
  onNodeHover?: (node: CaseNode, parent?: CaseNode) => string;
  onEdgeHover?: (node: CaseNode, parent?: CaseNode) => string;
}

export function Graph({ onNodeHover, onEdgeHover }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let destroy = () => {};

    if (containerRef.current) {
      destroy = runD3StuffSecondIteration(
        containerRef.current,
        onNodeHover,
        onEdgeHover
      );
    }

    return destroy;
  }, [onNodeHover, onEdgeHover]);

  return <div ref={containerRef} />;
}
