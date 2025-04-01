const svg = d3.select("svg");
const margin = { top: 40, right: 30, bottom: 120, left: 60 };
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;

const chart = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");

d3.csv("data.csv").then(data => {
  data.forEach(d => {
    d.PEAK = +d.PEAK;
    d.OFF_PEAK = +d.OFF_PEAK;
  });

  const routes = data.map(d => d.gtfs_route_long_name);
  const subgroups = ["PEAK", "OFF_PEAK"];

  const x0 = d3.scaleBand()
    .domain(routes)
    .range([0, width])
    .paddingInner(0.2);

  const x1 = d3.scaleBand()
    .domain(subgroups)
    .range([0, x0.bandwidth()])
    .padding(0.05);

  const y = d3.scaleLinear()
    .domain([0, 1])
    .nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(["#1f77b4", "#ff7f0e"]);

  // Axes
  chart.append("g")
    .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

  chart.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Bars with tooltip
  const groups = chart.selectAll("g.route")
    .data(data)
    .enter().append("g")
    .attr("class", "route")
    .attr("transform", d => `translate(${x0(d.gtfs_route_long_name)},0)`);

  groups.selectAll("rect")
    .data(d => subgroups.map(key => ({
      key,
      value: d[key],
      route: d.gtfs_route_long_name
    })))
    .enter().append("rect")
    .attr("x", d => x1(d.key))
    .attr("y", d => y(d.value))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y(d.value))
    .attr("fill", d => color(d.key))
    .on("mouseover", function (event, d) {
      d3.select(this).attr("opacity", 0.6);
      tooltip.style("visibility", "visible")
             .html(`<strong>${d.route}</strong><br>${d.key}: ${(d.value * 100).toFixed(1)}%`);
    })
    .on("mousemove", function (event) {
      tooltip.style("top", (event.pageY - 40) + "px")
             .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("opacity", 1);
      tooltip.style("visibility", "hidden");
    });
});

