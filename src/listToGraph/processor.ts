import {
  RawNode,
  RawEdge,
  ProcessedNode,
  RawNodeFlight,
  ProcessedNodeFlight,
  RawNodeCountry,
  ProcessedNodeCountry,
  RawNodePatient,
  ProcessedNodePatient,
  CaseNode,
} from "./interfaces";
import { assertNoneNull, parseAdHocDate } from "../utils";

export function genderHebToEng(heb: "זכר" | "נקבה"): "male" | "female" {
  return ({
    זכר: "male",
    נקבה: "female",
  } as const)[heb];
}

export function statusHebToEng(
  heb: "החלים" | "מאומת"
): "sick" | "healthy" | "dead" {
  return (
    ({
      החלים: "healthy",
      מאומת: "sick",
    } as const)[heb] || heb
  );
}

export function toCaseNodeTree(nodes: ProcessedNode[]): CaseNode[] {
  const caseNodes = nodes
    .map((n): CaseNode | null => {
      if (n.type === "Flight") {
        return {
          type: "Flight",
          name: n.name,
          id: n.id,
          date: n.date || new Date(),
        };
      } else if (n.type === "Patient") {
        return {
          id: n.id,
          type: "Patiant",
          name: `${n.name}`,
          date: n.firstPositiveResultDate,
          gender: n.gender,
          status: n.status,
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

export function buildGraph(
  rawNodes: { [x: string]: RawNode },
  rawEdges: RawEdge[]
) {
  const rawNodesAsArray = Object.values(rawNodes);
  const nodesMap = new Map(
    rawNodesAsArray.map((n) => [n.id, rawNodeToNode(n)])
  );

  for (const edge of rawEdges) {
    if (edge.from.id === edge.to.id) {
      console.warn("Direct circularity detected", edge);
      continue;
    }

    const parentNode = nodesMap.get(edge.from.id);
    const childNode = nodesMap.get(edge.to.id);

    assertNoneNull(parentNode);
    assertNoneNull(childNode);

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
  }
}

function flightRawNodeToNode(node: RawNodeFlight): ProcessedNodeFlight {
  let name = node.properties.name;
  if (!name) {
    console.warn("Flight Name missing:", node);
    name = "";
  }
  const p = parseFlightDetails(name);

  return {
    id: node.id,
    uid: node.properties.uid,
    name: p.name,
    type: "Flight",
    date: p.date,
    // raw: node,
    children: [],
    parents: [],
  };
}

function countryRawNodeToNode(node: RawNodeCountry): ProcessedNodeCountry {
  return {
    id: node.id,
    type: "Country",
    name: node.properties.name,
    uid: node.properties.uid,
    // raw: node,
    parents: [],
    children: [],
  };
}

function patientRawNodeToNode(node: RawNodePatient): ProcessedNodePatient {
  return {
    type: "Patient",
    id: node.id,
    uid: node.properties.uid,
    name: node.properties.name,
    firstPositiveResultDate: parseAdHocDate(
      node.properties.firstPositiveResultDate
    ),
    age: node.properties.age,
    dsid: node.properties.dsid,
    infectedLevel: node.properties.infectedLevel,
    infectedSource: node.properties.infectedSource,
    city: node.properties.city,
    gender: genderHebToEng(node.properties.gender),
    status: statusHebToEng(node.properties.status),
    children: [],
    parents: [],
    // raw: node,
  };
}

function parseFlightDetails(rawName: string) {
  const r = rawName.match(/(\d{2}\/\d{2}\/\d{4})$/);
  if (r === null) {
    return {
      name: rawName,
      date: null,
    };
  }

  return {
    name: rawName.replace("-" + r[1], ""),
    date: parseAdHocDate(r[1]),
  };
}

// function getAllAncestorsWithoutCircularity(
//   nodeId: number,
//   allNodes: ProcessedNode[]
// ) {
//   const allNodesMap = new Map(allNodes.map((n) => [n.id, n]));
//   const node = allNodesMap.get(nodeId)!;

//   const allParents = new Set(node.parents);

//   getAllAncestorsWithoutCircularityStep(nodeId, allNodesMap, allParents);

//   return allParents;
// }

// function getAllAncestorsWithoutCircularityStep(
//   nodeId: number,
//   allNodesMap: Map<number, ProcessedNode>,
//   allParents: Set<number>
// ) {
//   const node = allNodesMap.get(nodeId)!;

//   const effectiveParents = node.parents.filter((p) => !allParents.has(p));

//   if (effectiveParents.length > 0) {
//     for (const parent of effectiveParents) {
//       allParents.add(parent);
//       getAllAncestorsWithoutCircularityStep(parent, allNodesMap, allParents);
//     }
//   }
// }

// function getAllAncestorsWithoutCircularity(
//   nodeId: number,
//   allNodes: ProcessedNode[]
// ) {
//   const allNodesMap = new Map(allNodes.map((n) => [n.id, n]));
//   const node = allNodesMap.get(nodeId)!;

//   const allParents = new Set(node.parents);

//   getAllAncestorsWithoutCircularityStep(nodeId, allNodesMap, allParents);

//   return allParents;
// }

// function getAllAncestorsWithoutCircularityStep(
//   nodeId: number,
//   allNodesMap: Map<number, ProcessedNode>,
//   allParents: Set<number>
// ) {
//   const node = allNodesMap.get(nodeId)!;

//   const effectiveParents = node.parents.filter((p) => !allParents.has(p));

//   if (effectiveParents.length > 0) {
//     for (const parent of effectiveParents) {
//       allParents.add(parent);
//       getAllAncestorsWithoutCircularityStep(parent, allNodesMap, allParents);
//     }
//   }
// }
