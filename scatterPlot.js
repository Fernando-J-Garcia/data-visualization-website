fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
)
  .then((response) => response.json())
  .then((data) => {
    data.map((d) => {
      const today = new Date();
      const minutes = d.Time.split(":")[0];
      const seconds = d.Time.split(":")[1];
      return (d.Time = new Date(today.setHours(0, minutes, seconds)));
    });
    DrawScatterPlot(data);
  });

const DrawScatterPlot = (data) => {
  console.log(data);
  const margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 900 - margin.top - margin.bottom,
    height = 600 - margin.left - margin.right;
  const minX = d3.min(data, (d) => d.Year);
  const maxX = d3.max(data, (d) => d.Year);
  const minY = d3.min(data, (d) => d.Time);
  const maxY = d3.max(data, (d) => d.Time);

  const color = d3
    .scaleOrdinal()
    .domain([true, false])
    .range(["#C5D86D", "#F05D23"]);
  const xScale = d3
      .scaleLinear()
      .domain([minX - 1, maxX])
      .range([0, width]),
    yScale = d3.scaleTime().domain([maxY, minY]).range([height, margin.top]),
    xAxisScale = d3
      .scaleLinear()
      .domain([minX - 1, maxX])
      .range([0, width]),
    yAxisScale = d3
      .scaleTime()
      .domain([maxY, minY])
      .range([height, margin.top]);

  const svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [
      0,
      0,
      width + (margin.left + margin.right),
      height + (margin.top + margin.bottom),
    ])
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.format("d"));
  const timeFormat = d3.timeFormat("%M:%S");
  const yAxis = d3.axisLeft(yAxisScale).tickFormat(timeFormat);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("id", "x-axis")
    .call(xAxis);
  svg.append("g").attr("id", "y-axis").call(yAxis);

  const tooltip = d3.select("body").append("div").attr("id", "tooltip");

  const dot = svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d, i) => xScale(d.Year))
    .attr("cy", (d, i) => yScale(d.Time))
    .attr("r", (width - (margin.left + margin.right)) / data.length / 4)
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.Time)
    .style("fill", (d) => color(d.Doping !== ""))
    .on("mouseover", (event, d) => {
      tooltip.attr("data-year", d.Year);
      tooltip.transition().style("opacity", "100");
      tooltip
        .text(d.Name)
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px")
        .append("p")
        .attr("class", "tooltip-text")
        .text(`Year: ${d.Year}, Time: ${timeFormat(d.Time)}`)
        .append("p")
        .attr("class", "tooltip-text")
        .text(`${d.Doping}`);
    })
    .on("mouseout", (event, d) => {
      tooltip.transition().style("opacity", "0");
    });

  const legendContainer = svg.append("g").attr("id", "legend");
  const legend = legendContainer
    .selectAll("#legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend-text")
    .attr("transform", (d, i) => `translate (0, ${height / 2 - i * 20})`);
  legend
    .append("rect")
    .attr("x", width - 20)
    .attr("y", 2)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);
  legend
    .append("text")
    .attr("x", width - 20 - 10)
    .attr("y", 10)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text((d) => {
      return d ? "Riders with doping allegations" : "No doping Allegations";
    });
};
