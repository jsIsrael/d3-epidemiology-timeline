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

function makeFlatNodes(caseNodes: CaseNode[]) {
  return caseNodes.reduce<CaseNode[]>((a, b, c) => {
    a.push(b);
    if (b.children) {
      a.push(...makeFlatNodes(b.children));
    }

    return a;
  }, []);
}

function isSelfOrInChildren(
  wishedCaseNodeId: number,
  nodeToCheck: CaseNode
): boolean {
  if (wishedCaseNodeId === nodeToCheck.id) {
    return true;
  }

  if (nodeToCheck.children) {
    return nodeToCheck.children.some((childNode) => {
      return isSelfOrInChildren(wishedCaseNodeId, childNode);
    });
  }

  return false;
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
      return (
        parseInt(a.label.match(/\d+/g) as any) -
        parseInt(b.label.match(/\d+/g) as any)
      );
    });

  const [selectedNode, setSelectedNode] = React.useState(
    options.find((o) => o.value === nodeToStartWith)
  );

  const [applyAsFilter, setApplyAsFilter] = React.useState(false);

  const selectedNodeDebounced = useDebounce(selectedNode, 300);

  const maybeFilteredCaseNodes = React.useMemo(() => {
    if (applyAsFilter && selectedNode) {
      return inputCaseNodes.filter((c) => {
        return isSelfOrInChildren(selectedNode.value, c);
      });
    }

    return inputCaseNodes;
  }, [applyAsFilter, inputCaseNodes, selectedNode]);

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
        onCaseClick
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
  ]);

  React.useEffect(() => {
    if (!selectedNodeDebounced) {
      return;
    }

    setFocusOnSelectedNode(selectedNodeDebounced.value);
  }, [focusFn, selectedNodeDebounced, applyAsFilter]);

  const setFocusOnSelectedNode = (id: number) => {
    window.requestAnimationFrame(() => {
      const el = document.querySelector(`.id-${id}`);
      const previousFocused = document.querySelector(styles.focused);
      if (el) {
        focusFn.current && focusFn.current(el);
        el.firstElementChild?.classList.add(styles.focused);
        previousFocused?.classList.remove(styles.focused);
      }
    });
  };

  return (
    <>
      <div ref={containerRef} className={styles.container} />
      <div className={styles.menuContainer}>
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
        <input
          type="checkbox"
          checked={applyAsFilter}
          onChange={(e) => setApplyAsFilter((v) => !v)}
        />
        Use As Filter
      </div>
    </>
  );
}
