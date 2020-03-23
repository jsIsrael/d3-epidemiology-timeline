import * as React from "react";
// import { runD3Stuff } from "./runD3Stuff";
import { runD3StuffSecondIteration } from "./secondIterationD3";
import { Event } from "./data2ndIteration";
import { CaseNode } from "../listToGraph/interfaces";

interface Props {
  onNodeHover?: (node: CaseNode, parent?: CaseNode) => void;
  onEdgeHover?: (node: CaseNode, parent?: CaseNode) => void;
  nodeHoverTooltip?: (node: CaseNode, parent?: CaseNode) => string;
  edgeHoverTooltip?: (node: CaseNode, parent?: CaseNode) => string;
}

export function Graph({
  onNodeHover,
  onEdgeHover,
  nodeHoverTooltip,
  edgeHoverTooltip,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let destroy = () => {};

    if (containerRef.current) {
      destroy = runD3StuffSecondIteration(
        containerRef.current,
        onNodeHover,
        onEdgeHover,
        nodeHoverTooltip,
        edgeHoverTooltip
      );

      try {
        window.requestAnimationFrame(() => {
          document.querySelector(`.id-107991`)!.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        });
      } catch (e) {
        console.error(e);
      }
    }

    return destroy;
  }, [onNodeHover, onEdgeHover, nodeHoverTooltip, edgeHoverTooltip]);

  return <div ref={containerRef} />;
}
