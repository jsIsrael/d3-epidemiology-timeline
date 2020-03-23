export interface CaseNode {
  name: string;
  id: number;
  type: "Patiant" | "Flight";
  date: string | Date;
  gender?: "male" | "female";
  status?: "sick" | "healthy" | "dead";
  children?: CaseNode[];
}

export type ProcessedNode =
  | ProcessedNodeFlight
  | ProcessedNodePatient
  | ProcessedNodeCountry;

interface WithParentsAndChildren {
  parents: number[];
  children: number[];
}

export interface ProcessedNodeFlight extends WithParentsAndChildren {
  type: "Flight";
  id: number;
  date: Date | null;
  name: string;
  // raw: RawNodeFlight;
  uid: string;
}

export interface ProcessedNodePatient extends WithParentsAndChildren {
  type: "Patient";
  id: number;
  age: number;
  city: string;
  dsid: string;
  firstPositiveResultDate: Date;
  gender: "male" | "female";
  infectedLevel: InfectedLevel;
  infectedSource: string;
  name: string;
  status: "sick" | "healthy" | "dead";
  uid: string;
  // raw: RawNodePatient;
}

export interface ProcessedNodeCountry extends WithParentsAndChildren {
  type: "Country";
  id: number;
  // raw: RawNodeCountry;
  name: string;
  uid: string;
}

type RawEdgeType = "ARRIVED" | "TRANSFER";
interface RawEdgeFromTo {
  font: { size: number };
  icon: {
    code: "\uf072";
    color: "#000000";
    face: "FontAwesome";
    size: 25;
    weight: "bold";
  };
  // 107999
  id: number;
  label: "U22083-10/03/2020";
  shape: "icon";
}

export interface RawEdge {
  // ???
  arrows: "to";
  // "rgb(128,128,128)"
  color: string;
  from: RawEdgeFromTo;
  length: 100;
  // ???
  smooth: { roundness: 0.2; type: "curvedCCW" };
  to: RawEdgeFromTo;
  type: RawEdgeType;
}

export type NodeType = "Flight" | "Patient" | "Country";
export type NodeGender = "זכר" | "נקבה";
export type InfectedLevel =
  // what
  | 0
  // is
  | 1
  // that
  | 2;

type Status = "מאומת" | "החלים";

export type RawNode = RawNodeCountry | RawNodeFlight | RawNodePatient;

export interface RawNodeFlight {
  // 106649
  id: number;
  labels: ["Flight"];
  properties: {
    /**
     * "D454-05/03/2020" VS453-07/03/2020
     */
    name: string;
    /**
     * "244bc793880e4348b3dfc80f667ccc29"
     */
    uid: string;
  };
}

export interface RawNodePatient {
  /**
   * 106649
   *
   */
  id: number;
  labels: ["Patient"];
  properties: {
    age: number;
    //  קריית יערים
    city: string;
    // "8E07601C-2565-EA11-9154-005056846626"
    dsid: string;
    // 13/03/2020
    firstPositiveResultDate: string;
    // זכר/נקבה
    gender: NodeGender;
    infectedLevel: InfectedLevel;
    infectedSource: string;
    name: string;
    status: Status;
    // "d3d7388ea4ca498183bbd137859836c2"
    uid: string;
  };
}

export interface RawNodeCountry {
  // 106649
  id: number;
  labels: ["Country"];
  properties: {
    // צרפת
    name: string;
    // "908ba59588d745ae8e7cce63a21c3530";
    uid: string;
  };
}

export interface RawEdge {}
