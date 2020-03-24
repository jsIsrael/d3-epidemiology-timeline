import * as d3 from "d3";
import parse from "date-fns/parse";
import heTimeLocale from "./locale/he-IL.json";
import styles from "./secondIteration.module.css";
import classnames from "classnames";
import { events2 } from "./data2ndIteration";
import { CaseNode, RawNode, RawEdge } from "../listToGraph/interfaces";

import { toCaseNodeTree, buildGraph } from "../listToGraph/processor";
import { cleanGraph } from "../listToGraph/clean-graph";

const noop = () => {};

const noop2 = () => {
  return "";
};

export function prepareCaseNodes(
  rawNodes: { [x: string]: RawNode },
  rawEdges: RawEdge[],
  showOrphans: boolean
) {
  function isValidDate(d: Date | undefined | null) {
    if (d === undefined || d === null) {
      return false;
    }

    if (d.getTime() === 0) {
      return false;
    }

    return true;
  }

  const g = buildGraph(rawNodes, cleanGraph(rawEdges).edges).filter((n) => {
    if (n.type === "Patient" && !isValidDate(n.firstPositiveResultDate)) {
      return false;
    }

    if (n.type === "Flight" && !isValidDate(n.date)) {
      return false;
    }

    return true;
  });

  // console.log({
  //   g,
  //   a: buildGraph(rawNodes, cleanGraph(rawEdges).edges),
  // });

  // const g = buildGraph(rawNodes, rawEdges);

  const removeBadPatientsOrFlightsIds = new Set([
    107341,
    107881,
    107975,
    107924,
  ]);

  const casesBefore = toCaseNodeTree(g)
    // .filter((n) => n.children !== undefined)
    .filter((n) => !removeBadPatientsOrFlightsIds.has(n.id));

  const cases = showOrphans
    ? casesBefore
    : casesBefore.filter((n) => n.children !== undefined);

  return cases;
}

export function runD3StuffSecondIteration(
  container: HTMLDivElement,
  caseNodes: CaseNode[],
  onNodeHover: (node: CaseNode, parent?: CaseNode) => void = noop,
  onEdgeHover: (node: CaseNode, parent?: CaseNode) => void = noop,
  nodeHoverTooltip: (node: CaseNode, parent?: CaseNode) => string = noop2,
  edgeHoverTooltip: (node: CaseNode, parent?: CaseNode) => string = noop2
) {
  // @ts-ignore
  d3.timeFormatDefaultLocale(heTimeLocale);

  // set the dimensions and margins of the diagram
  const margin = { top: 20, right: 50, bottom: 30, left: 80 };

  const containerRect = container.getBoundingClientRect();
  const height = containerRect.height;
  const width = containerRect.width;

  const fakeRoot: CaseNode = {
    name: "Fake Root",
    date: new Date("2/01/2020"),
    type: "Flight",
    children: caseNodes,
    id: 123123,
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

  // const width = nodesInitial.height * 400;

  const innerWidth = nodesInitial.height * 200;
  const innerHeight = 16000;

  const treemap = d3.tree().size([innerHeight - 90, innerWidth]);

  // maps the node data to the tree layout
  const nodes = treemap(nodesInitial);

  const parseDate = (date: string | Date) =>
    date instanceof Date ? date : parse(date, "dd/MM/yyyy", 0);

  const startDate = nodes.descendants().reduce((minDate, { data }: any) => {
    // @ts-ignore
    return minDate > parseDate(data.date) ? parseDate(data.date) : minDate;
  }, new Date());

  const timeScale = d3
    .scaleTime()
    .domain([startDate, new Date()])
    .range([margin.left, innerWidth + margin.left]);

  const xAxis = d3
    .axisBottom(timeScale)
    .ticks(d3.timeDay.every(2))
    // @ts-ignore
    .tickFormat(d3.timeFormat("%d %b"));

  const zoom = d3
    .zoom()
    .scaleExtent([0.1, 40])
    .translateExtent([
      [-100, -100],
      [innerWidth + 90, innerHeight + 100],
    ])
    .on("zoom", () => {
      svg
        .select(".x.axis")
        .attr(
          "transform",
          `translate(${d3.event.transform.x}, ${
            height - 100 * d3.event.transform.k
          }) scale(${d3.event.transform.k})`
        );

      g.attr("transform", d3.event.transform);
    });

  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  const svg = d3
    .select(container)
    .append("svg")
    // @ts-ignore
    .call(zoom)
    .attr("width", width)
    .attr("height", height);
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

  let g = svg.append("g").attr("id", "innerGroup");
  // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg
    .append("g")
    .attr("class", "x axis")
    // .attr("transform", "translate(0," + height + ")")
    // .style("position", "fixed")
    .attr("transform", "translate(0," + (height - 30) + ")")
    .call(xAxis);

  const link = g.selectAll(".link").data(nodes.descendants().slice(1)).enter();

  const div = d3
    .select(container)
    .append("div")
    .attr("class", styles.tooltip)
    .style("opacity", 0);

  link
    .append("path")
    .on("mouseover", function (d: {
      data: CaseNode;
      parent: { data: CaseNode | undefined };
    }) {
      onEdgeHover(d.data, d.parent?.data);
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(edgeHoverTooltip(d.data, d.parent?.data))
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function (d: any) {
      div.transition().duration(200).style("opacity", 0);
    })
    .attr("marker-end", "url(#arrow)")
    .attr("id", (d: { data: { id: string } }) => "path" + d.data.id)
    .attr("class", (d: { depth: any }) =>
      classnames(styles.link, `level-${d.depth}`)
    )
    .attr("d", (d: d3.HierarchyPointNode<unknown> | null) => {
      const calcY = (item: d3.HierarchyPointNode<unknown> | null) =>
        // @ts-ignore
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
        // @ts-ignore
        calcY(d.parent) +
        "," +
        // @ts-ignore
        d.parent.x +
        "C" +
        // @ts-ignore
        (calcY(d) + calcY(d.parent)) / 2 +
        "," +
        // @ts-ignore
        d.parent.x +
        " " +
        // @ts-ignore
        ((calcY(d) + calcY(d.parent)) / 2 - 20) +
        "," +
        // @ts-ignore
        d.x +
        " " +
        (calcY(d) +
          // @ts-ignore
          (parseDate(d.parent.data.date) > parseDate(d.data.date) ? 10 : -10)) +
        "," +
        // @ts-ignore
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
  //   .text(({ data }: any) => data.name.split("").reverse().join(""));

  // adds each node as a group
  const node = g
    .selectAll(".node")
    // onNodeHover(d.data);
    .data(nodes.descendants())
    .enter()
    .append("g")
    .on("mouseover", function (d: {
      data: CaseNode;
      parent: { data: CaseNode | undefined };
    }) {
      onNodeHover(d.data, d.parent?.data);
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(nodeHoverTooltip(d.data, d.parent?.data))
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function (d: any) {
      div.transition().duration(200).style("opacity", 0);
    })
    .attr("class", function (d: {
      data: {
        id: any;
        type: string | number;
        gender: string | number;
        status: string | number;
      };
      depth: any;
      children: any;
    }) {
      return classnames(
        `id-${d.data.id}`,
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
    .attr("transform", function (d: {
      data: { date: string | Date };
      x: string;
    }) {
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
    .filter((d: { data: { type: string } }) => d.data.type === "Patiant")
    .append("circle")
    .attr("r", 10);

  node
    .filter((d: { data: { type: string } }) => d.data.type === "Flight")
    .append("rect")
    // @ts-ignore
    .attr("width", ({ data }: any) => data.name.length * 6 + 25)
    .attr("height", 20)
    .attr(
      "transform",
      // @ts-ignore
      ({ data }: any) => `translate(${-(data.name.length * 6) - 25}, -10)`
    );

  // Draw event rect
  const group = node
    // @ts-ignore
    .filter(({ data }: any) => data.description)
    .append("g")
    .attr("class", styles.case)
    .attr(
      "transform",
      // @ts-ignore
      ({ data }: any) => `translate(${-(data.description.length * 6) - 30}, 30)`
    );

  group
    .append("line")
    .attr("x1", ({ data }: any) => data.description.length * 6 + 10)
    .attr("y1", 10)
    .attr("x2", ({ data }: any) => data.description.length * 6 + 30)
    .attr("y2", -20);

  group
    .append("rect")
    .attr("width", ({ data }: any) => data.description.length * 6 + 10)
    .attr("height", 20);

  group
    .append("text")
    .attr("dx", 6)
    .attr("y", 20 / 2)
    .attr("dy", ".35em")
    .text(({ data }: any) => data.description);

  // node text
  node
    .append("text")
    .attr("dy", ".35em")
    .attr("x", function (d: { children: any }) {
      return d.children ? -13 : 13;
    })
    .style("text-anchor", function (d: { children: any }) {
      return d.children ? "end" : "start";
    })
    .text(function (d: { data: { name: any } }) {
      return d.data.name;
    });

  const events = svg.select(".x.axis");

  events2.forEach(({ date, description }) => {
    const g = events
      .append("g")
      .attr("transform", "translate(" + timeScale(date) + "," + 50 + ")")
      .attr("class", styles.event)
      .on("mouseover", function (d: any) {
        div.transition().duration(200).style("opacity", 0.9);
        div
          .html(description)
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        div.transition().duration(200).style("opacity", 0);
      });

    g.append("circle").attr("r", 10);

    g.append("text")
      .text(description.substr(0, 10) + "...")
      .attr("fill", "black");

    g.append("line")
      .attr("y1", 0)
      .attr("y2", innerHeight - 25)
      .attr("transform", "translate(0," + -innerHeight + ")");
  });

  return {
    destroy: () => {
      svg.remove();
    },
    focus: (el: { getBoundingClientRect: () => any }) => {
      const scale = d3?.event?.transform?.k || 1;
      // svg
      //   .select(".x.axis")
      //   .attr(
      //     "transform",
      //     `translate(${x}, ${height - 100 * scale}) scale(${scale})`
      //   );

      // g.attr("transform", `translate(${x}, ${y}) scale(${scale})`);

      // const [x, y] = data[Math.floor(Math.random() * data.length)];
      svg
        .transition()
        .duration(0)
        .call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(scale))
        .on("end", () => {
          const rect = el.getBoundingClientRect();
          svg
            .transition()
            .duration(1000)
            .call(
              zoom.transform,
              d3.zoomIdentity.translate(
                -rect.x + width / 2,
                -rect.y + height / 2
              )
            );
        });
    },
  };
}
