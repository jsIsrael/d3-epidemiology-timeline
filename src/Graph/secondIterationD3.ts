// @ts-nocheck

import * as d3 from "d3";
import parse from "date-fns/parse";
import heTimeLocale from "./locale/he-IL.json";
import styles from "./secondIteration.module.css";
import classnames from "classnames";
import treeData, { events } from "./data2ndIteration";
import { CaseNode } from "../listToGraph/interfaces";

import { toCaseNodeTree, buildGraph } from "../listToGraph/processor";
import { cleanGraph } from "../listToGraph/clean-graph";
import rawNodes from "../listToGraph/nodes.json";
import rawEdges from "../listToGraph/edges.json";

const noop = () => {};

const g = buildGraph(rawNodes, cleanGraph(rawEdges).edges);
// const g = buildGraph(rawNodes, rawEdges);

const removeBadPatientsOrFlightsIds = new Set([107341, 107881, 107975, 107924]);

const cases = toCaseNodeTree(g)
  .filter((n) => n.children !== undefined)
  .filter((n) => !removeBadPatientsOrFlightsIds.has(n.id));

// let lama = treeData;

export function runD3StuffSecondIteration(
  container: HTMLDivElement,
  onNodeHover: (node: CaseNode, parent?: CaseNode) => void = noop,
  onEdgeHover: (node: CaseNode, parent?: CaseNode) => void = noop,
  nodeHoverTooltip: (node: CaseNode, parent?: CaseNode) => string = noop,
  edgeHoverTooltip: (node: CaseNode, parent?: CaseNode) => string = noop
) {
  // @ts-ignore
  d3.timeFormatDefaultLocale(heTimeLocale);

  // set the dimensions and margins of the diagram
  const margin = { top: 20, right: 50, bottom: 30, left: 80 };
  const height = 16000;

  const fakeRoot: CaseNode = {
    name: "Fake Root",
    date: new Date("2/01/2020"),
    type: "Flight",
    children: cases,
    id: "blalbalb",
  };

  // for (const c of cases) {
  //   console.log("im as", c.id);
  //   d3.hierarchy(c, ({ children }) => children);
  //   console.log("done", c.id);
  // }

  //  assigns the data to a hierarchy using parent-child relationships
  let nodesInitial = d3.hierarchy(fakeRoot, ({ children }) => children);

  // let nodesInitial = d3.hierarchy(treeData, ({ children }) => children);
  // console.log(nodesInitial, nodesInitial1);

  const width = nodesInitial.height * 400;

  const treemap = d3.tree().size([height - 90, width]);

  // maps the node data to the tree layout
  const nodes = treemap(nodesInitial);

  const parseDate = (date: string) =>
    date instanceof Date ? date : parse(date, "dd/MM/yyyy", 0);

  const startDate = nodes.descendants().reduce((minDate, { data }) => {
    return minDate > parseDate(data.date) ? parseDate(data.date) : minDate;
  }, new Date());

  const timeScale = d3
    .scaleTime()
    .domain([startDate, new Date()])
    .range([margin.left, width + margin.left]);

  const xAxis = d3
    .axisBottom(timeScale)
    .ticks(d3.timeDay.every(2))
    .tickFormat(d3.timeFormat("%d %b"));

  const zoom = d3
    .zoom()
    .scaleExtent([1, 40])
    .translateExtent([
      [-100, -100],
      [width + 90, height + 100],
    ])
    .on("zoom", () => svg.attr("transform", d3.event.transform));

  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  // this kind of zoom is disabled for now
  // .call(zoom);

  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 10)
    .attr("refY", 5)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("class", styles.arrow)

    .attr("d", "M 0 0 L 10 5 L 0 10 z");

  let g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg
    .append("g")
    .call(xAxis)
    .attr("transform", "translate(0," + (height - 30) + ")");

  const link = g.selectAll(".link").data(nodes.descendants().slice(1)).enter();

  const div = d3
    .select(container)
    .append("div")
    .attr("class", styles.tooltip)
    .style("opacity", 0);

  link
    .append("path")
    .on("mouseover", function (d) {
      onEdgeHover(d.data, d.parent?.data);
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(edgeHoverTooltip(d.data, d.parent?.data))
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      div.transition().duration(200).style("opacity", 0);
    })
    .attr("marker-end", "url(#arrow)")
    .attr("id", (d) => "path" + d.data.id)
    .attr("class", (d) => classnames(styles.link, `level-${d.depth}`))
    .attr("d", (d) => {
      const calcY = (item: d3.HierarchyPointNode<unknown> | null) =>
        timeScale(parseDate(item.data.date)) - margin.left;

      // // draw lines to event rect
      // if (d.parent.data.description) {
      //   return (
      //     "M" +
      //     calcY(d) +
      //     "," +
      //     d.x +
      //     "C" +
      //     (calcY(d) + calcY(d.parent) - 20) / 2 +
      //     "," +
      //     d.x +
      //     " " +
      //     (calcY(d) + calcY(d.parent)) / 2 +
      //     "," +
      //     (d.parent.x + 40) +
      //     " " +
      //     (calcY(d.parent) - 20) +
      //     "," +
      //     (d.parent.x + 40)
      //   );
      // }

      return (
        "M" +
        calcY(d.parent) +
        "," +
        d.parent.x +
        "C" +
        (calcY(d) + calcY(d.parent)) / 2 +
        "," +
        d.parent.x +
        " " +
        ((calcY(d) + calcY(d.parent)) / 2 - 20) +
        "," +
        d.x +
        " " +
        (calcY(d) +
          (parseDate(d.parent.data.date) > parseDate(d.data.date) ? 10 : -10)) +
        "," +
        d.x
      );
    });

  // link
  //   .append("text")
  //   .attr("class", styles["line-text"])
  //   .append("textPath")
  //   .style("text-anchor", "middle")
  //   .style("pointer-events", "none")
  //   .attr("startOffset", "50%")
  //   .attr("xlink:href", (d) => `#path${d.data.id}`)
  //   .text(({ data }) => data.name.split("").reverse().join(""));

  // adds each node as a group
  const node = g
    .selectAll(".node")
    // onNodeHover(d.data);
    .data(nodes.descendants())
    .enter()
    .append("g")
    .on("mouseover", function (d) {
      onNodeHover(d.data, d.parent?.data);
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(nodeHoverTooltip(d.data, d.parent?.data))
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      div.transition().duration(200).style("opacity", 0);
    })
    .attr("class", function (d) {
      return classnames(
        `level-${d.depth}`,
        styles.node,
        styles[d.data.type],
        styles[d.data.gender],
        styles[d.data.status],
        {
          [styles["node--internal"]]: !!d.children,
          [styles["node--leaf"]]: !d.children,
        }
      );
    })
    .attr("transform", function (d) {
      return (
        "translate(" +
        (timeScale(parseDate(d.data.date)) - margin.left) +
        "," +
        d.x +
        ")"
      );
    });

  // adds the circle to the node
  node
    .filter((d) => d.data.type === "Patiant")
    .append("circle")
    .attr("r", 10);

  node
    .filter((d) => d.data.type === "Flight")
    .append("rect")
    .attr("width", ({ data }) => data.name.length * 6 + 25)
    .attr("height", 20)
    .attr(
      "transform",
      ({ data }) => `translate(${-(data.name.length * 6) - 25}, -10)`
    );

  // Draw event rect
  const group = node
    .filter(({ data }) => data.description)
    .append("g")
    .attr("class", styles.case)
    .attr(
      "transform",
      ({ data }) => `translate(${-(data.description.length * 6) - 30}, 30)`
    );

  group
    .append("line")
    .attr("x1", ({ data }) => data.description.length * 6 + 10)
    .attr("y1", 10)
    .attr("x2", ({ data }) => data.description.length * 6 + 30)
    .attr("y2", -20);

  group
    .append("rect")
    .attr("width", ({ data }) => data.description.length * 6 + 10)
    .attr("height", 20);

  group
    .append("text")
    .attr("dx", 6)
    .attr("y", 20 / 2)
    .attr("dy", ".35em")
    .text(({ data }) => data.description);

  // node text
  node
    .append("text")
    .attr("dy", ".35em")
    .attr("x", function (d) {
      return d.children ? -13 : 13;
    })
    .style("text-anchor", function (d) {
      return d.children ? "end" : "start";
    })
    .text(function (d) {
      return d.data.name;
    });

  events.forEach(({ date, description }) => {
    const g = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + timeScale(date) + "," + (height + 25) + ")"
      )
      .attr("class", styles.event);

    g.append("circle").attr("r", 10);

    g.append("text").text(description);

    g.append("line")
      .attr("y1", 0)
      .attr("y2", height - 25)
      .attr("transform", "translate(0," + (-height - 20) + ")");
  });

  return () => {
    svg.remove();
  };
}
