import * as d3 from "d3";
import parse from "date-fns/parse";
import format from "date-fns/format";
import heTimeLocale from "./locale/he-IL.json";
import styles from "./secondIteration.module.css";
import classnames from "classnames";
import { Event, events2 } from "./data2ndIteration";
import { CaseNode, RawEdgeV2, RawNode } from "../listToGraph/interfaces";
import { buildGraph, toCaseNodeTree } from "../listToGraph/processor";
import { noop, noop2 } from "./graphUtils";

export function prepareCaseNodes(
  rawNodes: RawNode[],
  rawEdges: RawEdgeV2[],
  showOrphans: boolean
) {
  const isValidDate = (d?: Date | null) => d && d.getTime() !== 0;

  const g = buildGraph(rawNodes, rawEdges).filter((n) => {
    if (n.type === "Patient" && !isValidDate(n.firstPositiveTestDate)) {
      return false;
    }

    return !(n.type === "Flight" && !isValidDate(n.date));
  });

  const removeBadPatientsOrFlightsIds = new Set<number>([
    // 107341,
    // 107881,
    // 107975,
    // 107924,
  ]);

  const casesBefore = toCaseNodeTree(g)
    .filter((n) => !removeBadPatientsOrFlightsIds.has(n.id))
    .sort((a, b) => {
      // @ts-ignore
      return a.date - b.date;
    });

  return showOrphans
    ? casesBefore
    : casesBefore.filter((n) => n.children !== undefined);
}

export function runD3StuffSecondIteration(
  container: HTMLDivElement,
  caseNodes: CaseNode[],
  onNodeHover: (node: CaseNode, parent?: CaseNode) => void = noop,
  onEdgeHover: (node: CaseNode, parent?: CaseNode) => void = noop,
  nodeHoverTooltip: (node: CaseNode, parent?: CaseNode) => string = noop2,
  edgeHoverTooltip: (node: CaseNode, parent?: CaseNode) => string = noop2,
  onCaseClick: (node: CaseNode, parent?: CaseNode) => void = noop,
  graphDense: number,
  refresh: number
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
    infectedSource: "לא ידוע",
    age: 38,
    city: "ירושלים",
  };

  //  assigns the data to a hierarchy using parent-child relationships
  let nodesInitial = d3.hierarchy(fakeRoot, ({ children }) => children);

  const innerWidth = nodesInitial.height * 700;

  const innerHeight = nodesInitial.leaves().length * 50;

  const treemap = d3
    .tree<CaseNode>()
    .size([innerHeight, innerWidth])
    .nodeSize([graphDense, 100]);

  // maps the node data to the tree layout
  const nodes = treemap(nodesInitial);

  const parseDate = (date: string | Date) =>
    date instanceof Date ? date : parse(date, "dd/MM/yyyy", 0);

  const startDate = [
    ...nodes.descendants().map(({ data }) => data),
    ...events2,
  ].reduce(
    (minDate: Date, { date }: { date: string | Date }) =>
      minDate > parseDate(date) ? parseDate(date) : minDate,
    new Date()
  );

  const timeScale = d3
    .scaleTime()
    .domain([startDate, new Date()])
    .range([0, innerWidth]);

  const xAxis = d3
    .axisBottom(timeScale)
    .ticks(d3.timeDay.every(2))
    // @ts-ignore
    .tickFormat(d3.timeFormat("%d %b"));

  const zoom = d3
    .zoom()
    .scaleExtent([0.05, 40])
    .translateExtent([
      [-100, -innerHeight],
      [innerWidth + 100, innerHeight + 100],
    ])
    .on("zoom", () => {
      svg
        .select(".x.axis")
        .attr(
          "transform",
          `translate(${d3.event.transform.x - 80 * d3.event.transform.k}, ${
            height - 100 * d3.event.transform.k
          }) scale(${d3.event.transform.k})`
        );

      g.attr(
        "transform",
        `translate(${d3.event.transform.x - 80 * d3.event.transform.k}, ${
          d3.event.transform.y - 300 * d3.event.transform.k
        }) scale(${d3.event.transform.k})`
      );
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

  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 10)
    .attr("refY", 5)
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("class", styles.arrow)
    .attr("d", "M 0 0 L 10 5 L 0 10 z");

  let g = svg.append("g").attr("id", "innerGroup");

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height - 30})`)
    .call(xAxis);

  const link = g.selectAll(".link").data(nodes.descendants().slice(1)).enter();

  // Add the tooltip element to the graph
  const tooltip = document.querySelector("#graph-tooltip");
  if (!tooltip) {
    const tooltipDiv = document.createElement("div");
    tooltipDiv.classList.add(styles.tooltip);
    tooltipDiv.style.opacity = "0";
    tooltipDiv.id = "graph-tooltip";
    document.body.appendChild(tooltipDiv);
  }
  const div = d3.select("#graph-tooltip");

  const addTooltip = (
    hoverTooltip: (node: CaseNode, parent?: CaseNode) => string = noop2,
    onHover: (node: CaseNode, parent?: CaseNode) => void = noop,
    d: any,
    x: number,
    y: number
  ) => {
    onHover(d.data, d.parent?.data);
    div.transition().duration(200).style("opacity", 0.9);
    div
      .html(hoverTooltip(d.data, d.parent?.data))
      .style("left", `${x}px`)
      .style("top", `${y - 28}px`);
  };

  const removeTooltip = () => {
    div.transition().duration(200).style("opacity", 0);
  };

  link
    .append("path")
    .on("mouseover", function (d: {
      data: CaseNode;
      parent: { data: CaseNode | undefined };
    }) {
      addTooltip(
        edgeHoverTooltip,
        onEdgeHover,
        d,
        d3.event.pageX,
        d3.event.pageY
      );
    })
    .on("mouseout", () => {
      removeTooltip();
    })
    .attr("marker-end", "url(#arrow)")
    .attr("id", (d: { data: { id: string } }) => `path${d.data.id}`)
    .attr("class", (d: { depth: number }) =>
      classnames(styles.link, `level-${d.depth}`)
    )
    .attr("d", (d: d3.HierarchyPointNode<CaseNode>) => {
      const calcY = (item: { data: CaseNode }) =>
        timeScale(parseDate(item.data.date)) - margin.left;

      const sameDate =
        // @ts-ignore
        parseDate(d.parent?.data.date).getDate() ===
        parseDate(d.data.date).getDate();

      const path =
        "M" +
        calcY(d.parent!) +
        "," +
        d.parent!.x +
        "C" +
        (calcY(d) + calcY(d.parent!)) / 2 +
        "," +
        d.parent!.x +
        " " +
        ((calcY(d) + calcY(d.parent!)) / 2 - 20) +
        "," +
        d.x +
        " " +
        (calcY(d) +
          (sameDate ? 30 : 0) +
          (parseDate(d.parent!.data.date) > parseDate(d.data.date) ? 5 : -5)) +
        "," +
        (d.x + (sameDate ? 30 : 0));
      if (path.indexOf("NaN") > 0) {
        return "";
      }
      return path;
    });

  // adds each node as a group
  const node = g
    .selectAll(".node")
    .data(nodes.descendants())
    .enter()
    .append("g")
    .on("mouseover", (d: { data: CaseNode; parent: { data?: CaseNode } }) => {
      addTooltip(
        nodeHoverTooltip,
        onNodeHover,
        d,
        d3.event.pageX,
        d3.event.pageY
      );
    })
    .on("mouseout", () => {
      removeTooltip();
    })
    .on("click", onCaseClick)
    .attr(
      "class",
      (d: {
        data: {
          id: number;
          type: string | number;
          gender: string | number;
          status: string | number;
        };
        depth: number;
        children: CaseNode[];
      }) =>
        classnames(
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
        )
    )
    .attr("transform", (d: d3.HierarchyPointNode<CaseNode>) => {
      const sameDate =
        // @ts-ignore
        parseDate(d.parent?.data.date).getDate() ===
        parseDate(d.data.date).getDate();
      const translate = `translate(${
        timeScale(parseDate(d.data.date)) - margin.left + (sameDate ? 30 : 0)
      }, ${sameDate ? d.x + 30 : d.x})`;
      if (translate.indexOf("NaN") > 0) {
        return "";
      }
      return translate;
    });

  node
    .filter((d: { data: CaseNode }) => d.data.type === "Flight")
    .append("svg:foreignObject")
    .attr("class", styles.icon)
    .attr("y", -6)
    .attr("x", 20)
    .html('<i class="fas fa-plane" />')
    .attr("width", ({ data }: { data: CaseNode }) => data.name.length + 25)
    .attr("height", 50)
    .attr(
      "transform",
      ({ data }: { data: CaseNode }) =>
        `translate(${-data.name.length - 25}, -10)`
    );

  node
    .filter((d: { data: CaseNode }) => d.data.type === "Tourist")
    .append("svg:foreignObject")
    .attr("class", `${styles.icon} ${styles.tourist}`)
    .attr("y", -6)
    .attr("x", 20)
    .html('<i class="fas fa-users" />')
    .attr("width", ({ data }: { data: CaseNode }) => data.name.length + 25)
    .attr("height", 50)
    .attr(
      "transform",
      ({ data }: { data: CaseNode }) =>
        `translate(${-data.name.length - 25}, -10)`
    );

  node
    .filter((d: { data: CaseNode }) => d.data.type === "Patiant")
    .append("svg:foreignObject")
    .attr(
      "class",
      (d: { data: CaseNode }) =>
        `${styles.icon} ${d.data.status && styles[d.data.status]} ${
          d.data.gender && styles[d.data.gender]
        }`
    )
    .attr("y", -14)
    .attr("x", -6)
    .html((d: { data: CaseNode }) => `<i class="fas fa-${d.data.gender}" />`);

  // Draw event rect
  const group = node
    .filter((d: { data: Event }) => d.data.description)
    .append("g")
    .attr("class", styles.case)
    .attr(
      "transform",
      ({ data }: { data: Event }) =>
        `translate(${-(data.description.length * 6) - 30}, 30)`
    );

  group
    .append("line")
    .attr("x1", ({ data }: { data: Event }) => data.description.length * 6 + 10)
    .attr("y1", 10)
    .attr("x2", ({ data }: { data: Event }) => data.description.length * 6 + 30)
    .attr("y2", -20);

  group
    .append("rect")
    .attr(
      "width",
      ({ data }: { data: Event }) => data.description.length * 6 + 10
    )
    .attr("height", 20);

  group
    .append("text")
    .attr("dx", 6)
    .attr("y", 20 / 2)
    .attr("dy", ".35em")
    .text(({ data }: { data: Event }) => data.description);

  // node text
  node
    .append("text")
    .attr("dy", "2em")
    .attr("x", (d: { children: CaseNode[] }) => (d.children ? -13 : 13))
    .style("text-anchor", "middle")
    .text((d: { data: CaseNode }) => d.data.name);

  const eventsElem = svg.select(".x.axis");

  Object.values(
    events2.reduce((sum, event) => {
      const arr = sum[format(event.date, "dd/MM/yyyy")] || [];
      sum[format(event.date, "dd/MM/yyyy")] = [...arr, event];
      return sum;
    }, {} as Record<string, Event[]>)
  ).forEach((events) => {
    const { date, description } = events.slice(1).reduce(
      (sum, { date, description }) => ({
        date,
        description: [sum.description, description].join(" & "),
      }),
      events[0]
    );

    const g = eventsElem
      .append("g")
      .attr("transform", `translate(${timeScale(date)},50)`)
      .attr("class", styles.event)
      .on("mouseover", () => {
        div.transition().duration(200).style("opacity", 0.9);
        div
          .html(description)
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        removeTooltip();
      });

    g.append("polygon")
      .attr("height", "40")
      .attr("width", "40")
      .attr("points", "20,10 30,20 20,30 10,20");

    g.append("text")
      .attr("class", styles["event-no-of-events"])
      .html(events.length);

    g.append("text")
      .attr("class", styles["event-text"])
      .text(description.substr(0, 10) + "...")
      .attr("fill", "black");

    g.append("line")
      .attr("y1", 0)
      .attr("y2", innerHeight - 25)
      .attr("transform", `translate(0,${innerHeight})`);
  });

  return {
    nodes: nodes
      .descendants()
      .slice(1)
      .map((n) => n.data),
    destroy: () => {
      svg.remove();
    },
    focus: (el: Element) => {
      const scale = d3?.event?.transform?.k || 1;

      svg
        .transition()
        .duration(0)
        .call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(scale))
        .on("end", () => {
          const rect = el.getBoundingClientRect();
          svg
            .transition()
            .duration(50)
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
