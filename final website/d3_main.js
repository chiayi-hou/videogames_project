// Define the dimensions and margins of the graph
const margin = { top: 100, right: 50, bottom: 100, left: 300 },
      width = 600,
      height = 800 - margin.top - margin.bottom;

// Define the colors for the pre and post 2000 sales
const colors = {
  'Pre 2000': '#69b3a2',
  'Post 2000': '#404080'
};

// Append the SVG object to the body of the page
const svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the Data
d3.csv("vgsales.csv").then(function(data) {
   data = data.filter(d => d.Year && d.Global_Sales);

  // Map data to the needed format
  const salesByPublisher = data.reduce((acc, d) => {
    const year = +d.Year;
    const sales = +d.Global_Sales;
    const period = year < 2000 ? 'sales_pre_2000' : 'sales_post_2000';

    if (!acc[d.Publisher]) {
      acc[d.Publisher] = { sales_pre_2000: 0, sales_post_2000: 0 };
    }

    acc[d.Publisher][period] += sales;

    return acc;
  }, {});

  // Convert to array and sum up total sales
  const publishers = Object.keys(salesByPublisher).map(publisher => ({
    publisher,
    ...salesByPublisher[publisher],
    total_sales: salesByPublisher[publisher].sales_pre_2000 + salesByPublisher[publisher].sales_post_2000
  }));

  // Sort publishers by total sales and slice the top 10
  const topPublishers = publishers.sort((a, b) => b.total_sales - a.total_sales).slice(0, 10);

// Add X axis
const x = d3.scaleLinear()
  .domain([0, d3.max(topPublishers, d => d.total_sales)])
  .range([0, width]);
// Add the X-axis to the svg
const xAxisGroup = svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x));

// Add the X-axis label
xAxisGroup.append("text")
  .attr("class", "axis-title")
  .attr("x", width / 2)
  .attr("y", 40) // Space to move the X-axis label down a bit
  .attr("fill", "#000") // Color of the text, you can change it as needed
  .style("font-size", "16px") // Size of the font, you can change it as needed
  .text("Global Sales (in millions)");

// Add Y axis
const y = d3.scaleBand()
  .range([0, height])
  .domain(topPublishers.map(d => d.publisher))
  .padding(.2);
// Add the Y-axis to the svg
const yAxisGroup = svg.append("g")
  .call(d3.axisLeft(y));

// Add the Y-axis label
yAxisGroup.append("text")
  .attr("class", "axis-title")
  .attr("transform", "rotate(-90)")
  .attr("y", -230) // Space to move the Y-axis label left a bit
  .attr("x", -height / 2)
  .attr("fill", "#000") // Color of the text, you can change it as needed
  .style("font-size", "16px") // Size of the font, you can change it as needed
  .attr("text-anchor", "middle")
  .text("Publisher");

  // Pre-2000 Bars
  svg.selectAll("myRect")
    .data(topPublishers)
    .join("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.publisher))
    .attr("width", d => x(d.sales_pre_2000))
    .attr("height", y.bandwidth())
    .attr("fill", "#69b3a2");

  // Post-2000 Bars
  svg.selectAll("myRect")
    .data(topPublishers)
    .join("rect")
    .attr("x", d => x(d.sales_pre_2000))
    .attr("y", d => y(d.publisher))
    .attr("width", d => x(d.sales_post_2000))
    .attr("height", y.bandwidth())
    .attr("fill", "#404080");

  // Adding title to the chart
  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .text("Top 15 Publishers by Global Sales (Pre and Post 2000)");

// Define the legend
const legend = svg.append("g")
  .attr("font-size", 12)
  .attr("text-anchor", "end")
  .selectAll("g")
  .data(['Pre 2000', 'Post 2000']) // Use the keys from the 'colors' object
  .enter().append("g")
  .attr("transform", (d, i) => `translate(${width - 10},${margin.top + i * 50})`);

// Add colored rectangles to the legend
legend.append("rect")
  .attr("x", 0)
  .attr("width", 19)
  .attr("height", 19)
  .attr("fill", d => colors[d]);

// Add text labels to the legend
legend.append("text")
  .attr("x", 0.001)
  .attr("y", 8)
  .attr("dy", "0.35em")
  .text(d => d);

});