// @ts-nocheck
import * as d3 from "d3";
import classnames from "classnames";
import heTimeLocale from "./locale/he-IL.json";
import treeData, { events } from "./data";
import graphStyles from "./graphStyle.module.css";

export function runD3Stuff(container: HTMLDivElement) {
  // @ts-ignore
  d3.timeFormatDefaultLocale(heTimeLocale);

  // set the dimensions and margins of the diagram
  const margin = { top: 20, right: 50, bottom: 30, left: 50 };
  const height = 300;

  //  assigns the data to a hierarchy using parent-child relationships
  let nodes = d3.hierarchy(treeData, ({ children }) => children);

  const width = nodes.height * 200;

  const treemap = d3.tree().size([height - 90, width]);

  // maps the node data to the tree layout
  const nodesStep2 = treemap(nodes);

  const timeScale = d3
    .scaleTime()
    .domain([treeData.date, new Date()])
    .range([margin.left, width + margin.left]);

  const xAxis = d3
    .axisBottom(timeScale)
    .ticks(d3.timeDay.every(2))
    .tickFormat(d3.timeFormat("%d %b"));

  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  let g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg
    .append("g")
    .call(xAxis)
    .attr("transform", "translate(0," + (height - 30) + ")");

  g.selectAll(".link")
    .data(nodesStep2.descendants().slice(1))
    .enter()
    .append("path")
    .attr("class", graphStyles.link)
    .attr("d", (d) => {
      const calcY = (item) => timeScale(item.data.date) - margin.left;

      if (d.parent.data.description) {
        return (
          "M" +
          calcY(d) +
          "," +
          d.x +
          "C" +
          (calcY(d) + calcY(d.parent) - 20) / 2 +
          "," +
          d.x +
          " " +
          (calcY(d) + calcY(d.parent)) / 2 +
          "," +
          (d.parent.x + 40) +
          " " +
          (calcY(d.parent) - 20) +
          "," +
          (d.parent.x + 40)
        );
      }

      return (
        "M" +
        calcY(d) +
        "," +
        d.x +
        "C" +
        (calcY(d) + calcY(d.parent)) / 2 +
        "," +
        d.x +
        " " +
        (calcY(d) + calcY(d.parent)) / 2 +
        "," +
        d.parent.x +
        " " +
        calcY(d.parent) +
        "," +
        d.parent.x
      );
    });

  // adds each node as a group
  const node = g
    .selectAll(".node")
    .data(nodesStep2.descendants())
    .enter()
    .append("g")
    .attr("class", function (d) {
      return classnames(graphStyles.node, {
        [graphStyles["node--internal"]]: !!d.children,
        [graphStyles["node--leaf"]]: !d.children,
      });
    })
    .attr("transform", function (d) {
      return (
        "translate(" + (timeScale(d.data.date) - margin.left) + "," + d.x + ")"
      );
    });

  // adds the circle to the node
  node.append("circle").attr("r", 10);

  // case
  const group = node
    .filter(({ data }) => data.description)
    .append("g")
    .attr("class", graphStyles.case)
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
      .attr("class", graphStyles.event);

    g.append("circle").attr("r", 10);

    g.append("text").text(description);

    g.append("line")
      .attr("y1", 0)
      .attr("y2", height - 25)
      .attr("transform", "translate(0," + (-height - 20) + ")");
  });
}
