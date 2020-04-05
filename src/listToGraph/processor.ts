import {
  RawNode,
  ProcessedNode,
  RawNodeFlight,
  ProcessedNodeFlight,
  RawNodeCountry,
  ProcessedNodeCountry,
  RawNodePatient,
  ProcessedNodePatient,
  CaseNode,
  RawEdgeV2,
  ProcessedNodeTourist,
  RawNodeTourist,
} from "./interfaces";
import { assertNoneNull } from "../utils";

export function genderHebToEng(heb: "זכר" | "נקבה"): "male" | "female" {
  return ({
    זכר: "male",
    נקבה: "female",
  } as const)[heb];
}

export function statusHebToEng(
  heb: "החלים" | "מאומת" | "נפטר"
): "sick" | "healthy" | "dead" {
  return (
    ({
      החלים: "healthy",
      מאומת: "sick",
      נפטר: "dead",
    } as const)[heb] || heb
  );
}

export function toCaseNodeTree(nodes: ProcessedNode[]): CaseNode[] {
  const caseNodes = nodes
    .map((n): CaseNode | null => {
      if (n.type === "Flight") {
        let country = "";
        try {
          // @ts-ignore
          country = nodes.find((localNode) => n.parents[0] === localNode.id)
            .name;
        } catch (e) {}

        return {
          type: "Flight",
          name: `${country} - ${n.name}`,
          id: n.id,
          date: n.date || new Date(),
          // @ts-ignore
          country,
        };
      } else if (n.type === "Patient") {
        return {
          id: n.id,
          type: "Patiant",
          name: `${n.name}`,
          date: n.firstPositiveTestDate,
          gender: n.gender,
          status: n.status,
          infectedSource: n.infectedSource,
        };
      }

      return null;
    })
    .filter((n): n is NonNullable<typeof n> => n !== null);

  const map = new Map(caseNodes.map((n) => [n.id, n]));
  const orignMap = new Map(nodes.map((n) => [n.id, n]));

  for (const n of caseNodes) {
    const o = orignMap.get(n.id)!;
    if (o.children.length > 0) {
      map.get(n.id)!.children = o.children
        .map((c) => map.get(c)!)
        .filter((c) => c.type !== "Flight");
    }
  }

  return caseNodes.filter((n) => {
    const o = orignMap.get(n.id)!;
    return o.parents.length === 0 || n.type === "Flight";
  });
}

export function buildGraph(rawNodes: RawNode[], rawEdges: RawEdgeV2[]) {
  const rawNodesAsArray = rawNodes.filter(
    // @ts-ignore
    (node) => node.labels[0] !== "Manifest"
  );
  const nodesMap = new Map(
    rawNodesAsArray.map((n) => [n.id, rawNodeToNode(n)])
  );

  for (const edge of rawEdges) {
    if (edge.start_node === edge.end_node) {
      console.warn("Direct circularity detected", edge);
      continue;
    }

    const parentNode = nodesMap.get(edge.start_node);
    const childNode = nodesMap.get(edge.end_node);

    try {
      assertNoneNull(parentNode);
      assertNoneNull(childNode);
    } catch (e) {
      continue;
    }

    parentNode.children.push(childNode.id);

    childNode.parents.push(parentNode.id);
  }

  const arr = [...nodesMap.values()];
  return arr;
}

function rawNodeToNode(rawNode: RawNode): ProcessedNode {
  switch (rawNode.labels[0]) {
    case "Country":
      return countryRawNodeToNode(
        // @ts-ignore
        rawNode
      );

    case "Flight":
      return flightRawNodeToNode(
        // @ts-ignore
        rawNode
      );

    case "Patient":
      return patientRawNodeToNode(
        // @ts-ignore
        rawNode
      );
    case "Tourist": {
      return touristRawNodeToNode(
        // @ts-ignore
        rawNode
      );
    }
  }
}

function touristRawNodeToNode(node: RawNodeTourist): ProcessedNodeTourist {
  let name = node.name;
  if (!name) {
    console.warn("Tourist Name missing:", node);
    name = "";
  }

  return {
    id: node.id,
    uid: node.uid,
    name: name,
    type: "Tourist",
    children: [],
    parents: [],
  };
}

function flightRawNodeToNode(node: RawNodeFlight): ProcessedNodeFlight {
  let name = node.name;
  if (!name) {
    console.warn("Flight Name missing:", node);
    name = "";
  }

  return {
    id: node.id,
    uid: node.uid,
    name: name,
    type: "Flight",
    date: new Date(node.arrivalDate),
    // raw: node,
    children: [],
    parents: [],
  };
}

function countryRawNodeToNode(node: RawNodeCountry): ProcessedNodeCountry {
  return {
    id: node.id,
    type: "Country",
    name: node.name,
    uid: node.uid,
    // raw: node,
    parents: [],
    children: [],
  };
}

function patientRawNodeToNode(node: RawNodePatient): ProcessedNodePatient {
  return {
    type: "Patient",
    id: node.id,
    uid: node.uid,
    name: node.name,
    firstPositiveTestDate: new Date(node.firstPositiveTestDate),
    age: node.age,
    dsid: node.dsid,
    infectedLevel: node.infectedLevel,
    infectedSource: node.infectedSource,
    city: node.city,
    gender: genderHebToEng(node.gender),
    status: statusHebToEng(node.status),
    children: [],
    parents: [],
    // raw: node,
  };
}
