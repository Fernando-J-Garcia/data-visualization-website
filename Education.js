//Fetch education data
fetch(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
)
  .then((response) => response.json())
  .then((educationData) => {
    console.log(educationData);
    drawChoropleth(educationData);
  })
  .catch((error) => console.error("Error:", error));

const drawChoropleth = (educationData) => {
  fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  )
    .then((response) => response.json())
    .then((usData) => {
      console.log(usData);
      drawMap(educationData, usData);
    })
    .catch((error) => console.error("Error:", error));
};

const drawMap = (educationData, usData) => {
  const countyData = topojson.feature(usData, usData.objects.counties).features;
  const edMin = d3.min(educationData, (d) => d.bachelorsOrHigher);
  const edMax = d3.max(educationData, (d) => d.bachelorsOrHigher);
  console.log(edMin + " " + edMax);

  //color Scheme
  const color = d3
    .scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
    .range(d3.schemeYlOrRd[9]);

  const tooltip = d3.select("body").append("div").attr("id", "tooltip");

  //Maps id to county and state object
  const idToStateMapper = {};
  countyData.forEach((d) => {
    educationData.filter((e, i) => {
      let key = i;
      if (e.fips === d.id) {
        idToStateMapper[d.id] = {
          state: e.state,
          area_name: e.area_name,
          bachelorsOrHigher: e.bachelorsOrHigher,
        };
      }
    });
  });

  const width = 1000,
    height = 700;

  //The canvas div everything gets drawn to
  const canvas = d3
    .select("#container")
    .append("svg")
    .attr("id", "canvas")
    .attr("width", width)
    .attr("height", height);

  const legendValues = [];
  //split the education data into 8 pieces and make a color boxes with each value
  for (
    let i = edMin;
    i < edMax;
    i += Math.round((edMax / 8 + Number.EPSILON) * 100) / 100
  ) {
    legendValues.push(i);
  }
  legendValues.sort((a, b) => a - b);
  console.log(legendValues);

  //Drawing the legend
  const legendRectWidth = 30;
  const legendContainer = canvas.append("g").attr("id", "legend");
  const legend = legendContainer
    .selectAll("#legend")
    .data(legendValues)
    .enter()
    .append("g")
    .attr(
      "transform",
      (d, i) =>
        `translate(${
          width - legendValues.length * 50 + legendRectWidth * i
        }, 50)`
    );
  legend
    .append("rect")
    .attr("width", legendRectWidth)
    .attr("height", 10)
    .attr("x", 0)
    .attr("y", 0)
    .style("fill", (d) => color(d));

  //Drawing legend axis
  const legendScale = d3
    .scaleLinear()
    .domain([edMin, edMax])
    .range([0, legendRectWidth * legendValues.length]);
  const legendAxis = d3
    .axisBottom(legendScale)
    .tickSize(10)
    .tickFormat((x) => Math.round(x) + "%")
    .tickValues(color.domain());
  canvas
    .append("g")
    .attr(
      "transform",
      (d, i) =>
        `translate(${
          width - legendValues.length * 50 + legendRectWidth * i
        }, 50)`
    )
    .attr("id", "legend-axis")
    .call(legendAxis)
    //remove top part of axis
    .select(".domain")
    .remove();

  //Drawing the counties
  canvas
    .selectAll("path")
    .data(countyData)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("class", "county")
    .attr("fill", (d) => {
      const currCounty = educationData.filter((e, i) => {
        if (e.fips === d.id) {
          return e;
        }
      })[0];
      return color(currCounty.bachelorsOrHigher);
    })
    .attr("data-fips", (d) => d.id)
    .attr("data-education", (d) => idToStateMapper[d.id].bachelorsOrHigher)
    .on("mouseover", (event, d) => {
      tooltip.attr("data-education", idToStateMapper[d.id].bachelorsOrHigher);
      tooltip.transition().style("opacity", "100");
      const state = idToStateMapper[d.id].state;
      const county = idToStateMapper[d.id].area_name;
      const bachelorsPercentage = idToStateMapper[d.id].bachelorsOrHigher;
      tooltip
        .text(county + ", " + state + " " + bachelorsPercentage + "%")
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px");
    })
    .on("mouseout", (event, d) => {
      tooltip.transition().style("opacity", "0");
    });

  //Draw the lines between the states
  canvas
    .append("path")
    .datum(
      topojson.mesh(usData, usData.objects.states, function (a, b) {
        return a !== b;
      })
    )
    .attr("class", "states")
    .attr("d", d3.geoPath());
};
