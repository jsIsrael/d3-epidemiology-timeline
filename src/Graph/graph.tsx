import * as React from "react";
// import { runD3Stuff } from "./runD3Stuff";
import { runD3StuffSecondIteration } from "./secondIterationD3";
import { CaseNode } from "../listToGraph/interfaces";
import Select from "react-select";
import styles from "./secondIteration.module.css";
import { useDebounce } from "../utils";

interface Props {
  onNodeHover?: (node: CaseNode, parent?: CaseNode) => void;
  onEdgeHover?: (node: CaseNode, parent?: CaseNode) => void;
  nodeHoverTooltip?: (node: CaseNode, parent?: CaseNode) => string;
  edgeHoverTooltip?: (node: CaseNode, parent?: CaseNode) => string;
  caseNodes: CaseNode[];
  nodeToStartWith: number;
}

export function Graph({
  onNodeHover,
  onEdgeHover,
  nodeHoverTooltip,
  edgeHoverTooltip,
  caseNodes,
  nodeToStartWith,
}: Props) {
  const focusFn = React.useRef<(e: Element) => void>(() => {});

  const containerRef = React.useRef<HTMLDivElement>(null);

  const options = React.useMemo(
    () =>
      caseNodes.map((n) => ({
        value: n.id,
        label: n.name,
      })),
    [caseNodes]
  );

  const [selectedNode, setSelectedNode] = React.useState(
    options.find((o) => o.value === nodeToStartWith)
  );

  const selectedNodeDebounced = useDebounce(selectedNode, 1000);

  React.useEffect(() => {
    let destroyFn = () => {};

    if (containerRef.current) {
      const { destroy, focus } = runD3StuffSecondIteration(
        containerRef.current,
        caseNodes,
        onNodeHover,
        onEdgeHover,
        nodeHoverTooltip,
        edgeHoverTooltip
      );

      focusFn.current = focus;
      destroyFn = destroy;
    }

    return destroyFn;
  }, [onNodeHover, onEdgeHover, nodeHoverTooltip, edgeHoverTooltip, caseNodes]);

  React.useEffect(() => {
    if (!selectedNodeDebounced) {
      return;
    }

    window.requestAnimationFrame(() => {
      const el = document.querySelector(`.id-${selectedNodeDebounced.value}`);
      if (el) {
        focusFn.current && focusFn.current(el);
      }
    });
  }, [focusFn, selectedNodeDebounced]);

  return (
    <>
      <div ref={containerRef} className={styles.container} />
      <div
        style={{
          width: 300,
          // height: 100,
          position: "fixed",
          top: 10,
          left: 10,
          // backgroundColor: "red",
          boxShadow: "1px 1px 1px #000",
        }}
      >
        <Select
          isSearchable={true}
          isClearable={true}
          isRtl={true}
          options={options}
          value={selectedNode}
          onChange={(v: any) => {
            setSelectedNode(v);
          }}
        />
      </div>
    </>
  );
}
