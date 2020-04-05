import * as React from "react";
import { runD3StuffSecondIteration } from "./secondIterationD3";
import { CaseNode } from "../listToGraph/interfaces";
import Select from "react-select";
import MenuList from "./menuList";
import { makeFlatNodes, isSelfOrInChildren } from "./graphUtils";
import { useDebounce } from "../utils";
import styles from "./secondIteration.module.css";

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
  caseNodes: inputCaseNodes,
  nodeToStartWith,
}: Props) {
  const focusFn = React.useRef<(e: Element) => void>(() => {});
  const containerRef = React.useRef<HTMLDivElement>(null);

  const flatNodes = React.useMemo(() => makeFlatNodes(inputCaseNodes), [
    inputCaseNodes,
  ]);

  const options = flatNodes
    .map(({ id, name }) => ({
      value: id,
      label: name,
    }))
    .sort((a, b) => {
      return a.label.localeCompare(b.label, "he", {
        sensitivity: "base",
        numeric: true,
      });
    });

  const [selectedNode, setSelectedNode] = React.useState(
    options.find((o) => o.value === nodeToStartWith)
  );
  const selectedNodeDebounced = useDebounce(selectedNode, 300);

  const [applyAsFilter, setApplyAsFilter] = React.useState(false);
  const [
    applyUnknownInfectedSource,
    setApplyUnknownInfectedSource,
  ] = React.useState(false);
  const [graphDense, setGraphDense] = React.useState(50);

  const maybeFilteredCaseNodes = React.useMemo(() => {
    if (applyAsFilter && selectedNode) {
      return inputCaseNodes.filter((c) => {
        return isSelfOrInChildren(selectedNode.value, c);
      });
    }

    if (applyUnknownInfectedSource) {
      return inputCaseNodes.filter((c) => {
        return applyUnknownInfectedSource && c.infectedSource === "לא ידוע";
      });
    }

    return inputCaseNodes;
  }, [applyAsFilter, inputCaseNodes, selectedNode, applyUnknownInfectedSource]);

  const onCaseClick = (e: any) => {
    const selected = options.find((option) => {
      return e.data.id === option.value;
    });
    setSelectedNode(selected);
  };

  React.useEffect(() => {
    let destroyFn = () => {};

    if (containerRef.current) {
      const { destroy, focus } = runD3StuffSecondIteration(
        containerRef.current,
        maybeFilteredCaseNodes,
        onNodeHover,
        onEdgeHover,
        nodeHoverTooltip,
        edgeHoverTooltip,
        onCaseClick,
        graphDense
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
    maybeFilteredCaseNodes,
    graphDense,
  ]);

  React.useEffect(() => {
    if (!selectedNodeDebounced) {
      return;
    }

    setFocusOnSelectedNode(selectedNodeDebounced.value);
  }, [
    focusFn,
    selectedNodeDebounced,
    applyAsFilter,
    applyUnknownInfectedSource,
  ]);

  const setFocusOnSelectedNode = (id: number) => {
    window.requestAnimationFrame(() => {
      const el = document.querySelector(`.id-${id}`);
      const previousFocused = document.querySelector(`.${styles.focused}`);
      if (el) {
        focusFn.current && focusFn.current(el);
        el.firstElementChild?.classList.add(styles.focused);
        previousFocused?.classList.remove(styles.focused);
      }
    });
  };

  const handleDenseChange = (e: any) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setGraphDense(value);
    }
  };

  return (
    <>
      <div ref={containerRef} className={styles.container} />
      <div id="graph-select-container" className={styles.menuContainer}>
        <Select
          isSearchable={true}
          isClearable={true}
          isRtl={true}
          options={options}
          value={selectedNode}
          components={{ MenuList }}
          onChange={(v: any) => {
            setSelectedNode(v);
          }}
        />
        <input
          type="checkbox"
          checked={applyAsFilter}
          onChange={(e) => setApplyAsFilter((v) => !v)}
        />
        Use As Filter
        <br />
        <input
          type="checkbox"
          checked={applyUnknownInfectedSource}
          onChange={(e) => setApplyUnknownInfectedSource((v) => !v)}
        />
        Infected Source Unknown
        <br />
        <input
          min={15}
          max={50}
          value={graphDense}
          onChange={handleDenseChange}
        />
        <br />
        Change Graph Dense
      </div>
    </>
  );
}
