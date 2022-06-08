fetch(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    drawTreeMap(data);
  });

const drawTreeMap = (data) => {
  const margin = { top: 20, right: 20, bottom: 20, left: 20 },
    width = 1000 - margin.right - margin.left,
    height = 600 - margin.top - margin.bottom;

  const categories = data.children.map((d) => d.name);
  console.log(categories);
  const color = d3.scaleOrdinal().domain(categories).range(d3.schemeCategory10);

  const zoom = d3.zoom().on("zoom", (e) => {
    const transform = e.transform;
    if (cellsContainer === null) return;
    cellsContainer.attr("transform", transform.toString());
  });

  const container = d3.select("#container");
  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "tree-map")
    .call(zoom);

  //Tooltip
  const tooltip = d3.select("body").append("div").attr("id", "tooltip");

  //Drawing the legend
  const legendRectWidth = 10;
  const legendPadding = { top: 20, bottom: 20 };
  const legendContainer = container.append("svg").attr("id", "legend");
  const legend = legendContainer
    .selectAll("#legend")
    .data(categories)
    .enter()
    .append("g")
    .attr(
      "transform",
      (d, i) => `translate(${0}, ${30 * i + legendPadding.top})`
    );
  legend
    .append("rect")
    .attr("width", legendRectWidth)
    .attr("height", 10)
    .attr("x", 0)
    .attr("y", 0)
    .attr("class", "legend-item")
    .style("fill", (d) => color(d));
  legend
    .append("text")
    .attr("x", legendRectWidth + 5)
    .attr("y", 10)
    .attr("id", "legend-text")
    .text((d) => d);

  const cellsContainer = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const root = d3.hierarchy(data).sum((d) => d.value);

  d3.treemap().size([width, height]).padding(2)(root);

  const cell = cellsContainer
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`);

  cell
    .append("rect")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("class", "tile")
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .style("stroke", "black")
    .style("fill", (d) => color(d.data.category))
    .on("mouseover", (event, d) => {
      tooltip.attr("data-value", d.data.value);
      tooltip.transition().style("opacity", "100");
      tooltip
        .text(`Name: ${d.data.name}`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px")
        .append("p")
        .attr("class", "tooltip-text")
        .text(`Category: ${d.data.category}`)
        .append("p")
        .attr("class", "tooltip-text")
        .text(`Value: ${d.data.value}`);
    })
    .on("mouseout", (event, d) => {
      tooltip.transition().style("opacity", "0");
    });

  cell
    .append("text")
    .attr("x", 5)
    .attr("y", 15)
    .text((d) => d.data.name)
    .attr("font-size", "10px")
    .attr("fill", "white")
    .attr("data-width", (d) => d.x1 - d.x0)
    .call(wrapText);
};

//Function by Mike Bostock
//Found here-> https://bl.ocks.org/mbostock/7555321
function wrapText(selection) {
  selection.each(function () {
    const node = d3.select(this);
    const rectWidth = +node.attr("data-width");
    let word;
    const words = node.text().split(" ").reverse();
    let line = [];
    const x = node.attr("x");
    const y = node.attr("y");
    let tspan = node.text("").append("tspan").attr("x", x).attr("y", y);
    let lineNumber = 0;
    while (words.length > 1) {
      word = words.pop();
      line.push(word);
      tspan.text(line.join(" "));
      const tspanLength = tspan.node().getComputedTextLength();
      if (tspanLength > rectWidth && line.length !== 1) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = addTspan(word);
      }
    }

    addTspan(words.pop());

    function addTspan(text) {
      lineNumber += 1;
      return node
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", `${lineNumber * 10}px`)
        .text(text);
    }
  });
}
