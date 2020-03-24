import * as React from "react";
// import { runD3Stuff } from "./runD3Stuff";
import {
  runD3StuffSecondIteration,
  prepareCaseNodes,
} from "./secondIterationD3";
import { CaseNode, RawNode, RawEdge } from "../listToGraph/interfaces";
import Select from "react-select";
import styles from "./secondIteration.module.css";

interface Props {
  onNodeHover?: (node: CaseNode, parent?: CaseNode) => void;
  onEdgeHover?: (node: CaseNode, parent?: CaseNode) => void;
  nodeHoverTooltip?: (node: CaseNode, parent?: CaseNode) => string;
  edgeHoverTooltip?: (node: CaseNode, parent?: CaseNode) => string;
  rawNodes: { [x: string]: RawNode };
  rawEdges: RawEdge[];
  nodeToStartWith: number;
}

export function Graph({
  onNodeHover,
  onEdgeHover,
  nodeHoverTooltip,
  edgeHoverTooltip,
  rawNodes,
  rawEdges,
  nodeToStartWith,
}: Props) {
  const rawNodesAsArray = React.useMemo(() => Object.values(rawNodes), [
    rawNodes,
  ]);

  const options = React.useMemo(
    () =>
      rawNodesAsArray
        // @ts-ignore
        .filter((n) => n.properties?.name)
        .filter((n) => n.labels[0] !== "Country")
        .map((n) => ({
          value: n.id,
          // @ts-ignore
          label: n.properties?.name,
        })),
    [rawNodesAsArray]
  );

  const focusFn = React.useRef((el: Element) => {});

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = React.useState(
    options.find((o) => o.value === nodeToStartWith)
  );
  const [showOrphans, setShowOrphans] = React.useState(false);

  const selectedNodeDebounced = useDebounce(selectedNode, 1000);

  const caseNodes = React.useMemo(
    () => prepareCaseNodes(rawNodes, rawEdges, showOrphans),
    [rawEdges, rawNodes, showOrphans]
  );

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
  }, [
    onNodeHover,
    onEdgeHover,
    nodeHoverTooltip,
    edgeHoverTooltip,
    showOrphans,
    caseNodes,
  ]);

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
        <br />
        <input
          type="checkbox"
          checked={showOrphans}
          onChange={() => {
            setShowOrphans((v) => {
              return !v;
            });
          }}
        />{" "}
        Show Singular
      </div>
    </>
  );
}

// Hook
function useDebounce<T>(value: T, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}
