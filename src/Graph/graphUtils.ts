import { CaseNode } from "../listToGraph/interfaces";

export const noop = () => {};
export const noop2 = () => {
  return "";
};

export function makeFlatNodes(caseNodes: CaseNode[]) {
  return caseNodes.reduce<CaseNode[]>((a, b, c) => {
    a.push(b);
    if (b.children) {
      a.push(...makeFlatNodes(b.children));
    }

    return a;
  }, []);
}

export function isSelfOrInChildren(
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

export const getSameDate = (parent: any, child: any, parseDate: any) => {
  if (!parent || parent.type === "Flight") {
    return false;
  }

  const parentDate = parseDate(parent.date);
  const childDate = parseDate(child.date);
  const sameDate =
    parentDate.getDate() === parentDate.getDate() &&
    parentDate.getMonth() === childDate.getMonth() &&
    parentDate.getFullYear() === childDate.getFullYear();
  return sameDate;
};
