fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
)
  .then((response) => response.json())
  .then((data) => {
    drawHeatMap(data.monthlyVariance, data.baseTemperature);
  });
const drawHeatMap = (data, baseTemperature) => {
  //Format months to start at 0 index instead of 1
  data.forEach((d) => (d.month -= 1));
  console.log(data);
  const margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 1800 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;
  const minX = d3.min(data, (d) => d.year);
  const maxX = d3.max(data, (d) => d.year);
  const minY = d3.min(data, (d) => d.month);
  const maxY = d3.max(data, (d) => d.month);

  //colorScheme = ['#e93e3a','#ed683c','#f3903f','#fdc70c','	#fff33b']
  const color = d3
    .scaleSequential()
    //.domain([d3.min(data,d=>d.variance), d3.max(data,d=>d.variance)])
    .domain([d3.max(data, (d) => d.variance), d3.min(data, (d) => d.variance)])
    .interpolator(d3.interpolateRdYlBu);

  const xScale = d3.scaleLinear().domain([minX, maxX]).range([0, width]),
    yScale = d3
      .scaleBand()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      .rangeRound([0, height]);

  const svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height + (margin.top + margin.bottom))
    .attr("viewBox", [
      0,
      0,
      width + (margin.left + margin.right),
      height + (margin.top + margin.bottom),
    ])
    .append("g")
    .attr("transform", "translate(" + margin.left + ",0)");

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const timeFormat = d3.timeFormat("%M:%S");
  const yAxis = d3.axisLeft(yScale).tickFormat((month) => {
    const date = new Date();
    date.setUTCMonth(month);
    console.log(date + " " + month);
    const format = d3.timeFormat("%B");
    return format(date);
  });

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("id", "x-axis")
    .call(xAxis);
  svg.append("g").attr("id", "y-axis").call(yAxis);

  const legendValues = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

  const legendContainer = svg.append("g").attr("id", "legend");
  const legend = legendContainer
    .selectAll("#legend")
    .data(legendValues)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${20 * i}, 0)`);
  legend
    .append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("x", 0)
    .attr("y", height + (margin.top + margin.bottom))
    .style("fill", (d) => color(d));

  const legendScale = d3.scaleLinear().domain(legendValues).range([0, 20]);
  const legendxAxis = d3.axisTop(legendScale).tickFormat(d3.format("d"));
  svg
    .append("g")
    .attr("transform", `translate(0, ${height + margin.top + margin.bottom})`)
    .attr("id", "legend-x-axis")
    .call(legendxAxis);

  const tooltip = d3.select("body").append("div").attr("id", "tooltip");

  const description = d3
    .select("#container")
    .select("h4")
    .text(minX + "-" + maxX + ": base temperature " + baseTemperature + "°C");

  const cell = svg
    .selectAll(".cell")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("width", (width + margin.left + margin.right) / (maxX - minX))
    .attr("height", height / 12)
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month))
    .attr("data-month", (d) => d.month)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => d.variance)
    .style("fill", (d) => color(d.variance))
    .on("mouseover", (event, d) => {
      const date = new Date(d.year, d.month);
      tooltip.attr("data-year", d.year);
      tooltip.transition().style("opacity", "100");
      tooltip
        .text(d3.timeFormat("%Y - %B")(date))
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px")
        .append("p")
        .attr("class", "tooltip-text")
        .text((baseTemperature + d.variance).toFixed(3) + "°C")
        .append("p")
        .attr("class", "tooltip-text")
        .text((d.variance > 0 ? "+" + d.variance : d.variance) + "°C");
    })
    .on("mouseout", (event, d) => {
      tooltip.transition().style("opacity", "0");
    });
};
