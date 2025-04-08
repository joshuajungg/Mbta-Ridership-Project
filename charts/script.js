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

  data.sort((a, b) => d3.ascending(a.gtfs_route_long_name, b.gtfs_route_long_name));

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

  chart.append("g")
    .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

  chart.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

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

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 200}, 20)`);

  const legendData = [
    { label: "PEAK", color: "#1f77b4" },
    { label: "OFF_PEAK", color: "#ff7f0e" }
  ];

  legend.selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 20)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => d.color);

  legend.selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", 20)
    .attr("y", (d, i) => i * 20 + 12)
    .text(d => d.label)
    .style("font-size", "13px")
    .attr("alignment-baseline", "middle");
});






