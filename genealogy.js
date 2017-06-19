var root = d3.hierarchy(bobs, function children(d) { return d.clones; });


//var nodeSpacingWidth = 30;
var nodeSpacingHeight = 800;
var height = getWindowHeight();
var width = height * 6; //improve

var nodeSize = 14;

// Path trace
var updatedLinks = null;


// Timeline mapping
var timeScale = d3.scaleLinear()
  .domain([2130, 2175])
  .range([0, width]);

// Tree
var treeLayout = d3.tree(root)
  .size([height - 100, width])

treeLayout(root);
root.each(function(node) { node.y = timeScale(node.data.born); }); // map tree y-axis to timeline.

var svg = d3.select("svg")
  .attr('width', width)
  .attr('height', height)

g = svg.append("g")
  .attr("class", 'tree')
  .attr("transform", "translate(0,50)")
g.append("g").attr("class", "time-line")
  .attr("transform", "translate(0,-30)")
g.append("g").attr("class", "date-bar")
g.append("g").attr("class", "links")
g.append("g").attr("class", "nodes")

var ticks = [];

for (var i = 2130; i < 2175; i++) {
  ticks.push(i)
}

var timeLine = d3.select('svg g.time-line')
  .selectAll('line')
  .data(ticks)
  .enter()
  .append('g');

timeLine
  .append('line')
  .attr('class', function(d) { return d % 10 == 0 ? 'whole-tick' : 'tick' })
  .attr('x1', function(d) { return timeScale(d); })
  .attr('y1', function(d) { return 30; })
  .attr('x2', function(d) { return timeScale(d); })
  .attr('y2', function(d) { return height; });

timeLine
  .append('text')
  .attr('class', 'time')
  .attr('x', function(d) { return timeScale(d); })
  .attr('y', '15px')
  .attr('dx', '-1.2em')
  .text(function(d) { return +d })

var dateBar = svg.select('g.date-bar')

dateBar
  .append('line')
  .attr('class', 'date-bar')
  .attr('x1', function(d) { return 0; })
  .attr('y1', function(d) { return 0; })
  .attr('x2', function(d) { return 0; })
  .attr('y2', function(d) { return height; })

update();

function update() {
  var nodes = d3.select('svg g.nodes')
    .selectAll('circle.node')
    .data(root.descendants());

  var links = d3.select('svg g.links')
    .selectAll('line.link')
    .data(updatedLinks || root.links());

  nodes.classed('selected', function(d) { return d.nodeInPath === true ? true : false });
  links.classed('selected', function(d) { return d.linkInPath === true ? true : false });

  nodes.enter()
    .append('circle')
    .classed('node', true)
    .attr('cx', function(d) { return d.y; })
    .attr('cy', function(d) { return d.x; })
    .attr('r', nodeSize / 2)
    .on("mouseover", markPath)
  //.on("mouseout", releasePath);

  nodes.enter()
    .append('text')
    .attr('x', function(d) { return d.y + nodeSize / 2 + 5; })
    .attr('y', function(d) { return d.x; })
    .attr('dy', '0.31em')
    .style("text-anchor", "start")
    .text(function(d) { return d.data.name });

  links.enter()
    .append('line')
    .classed('link', true)
    .attr('x1', function(d) { return d.source.y; })
    .attr('y1', function(d) { return d.source.x; })
    .attr('x2', function(d) { return d.target.y; })
    .attr('y2', function(d) { return d.target.x; });

}

function getLargestDepth(node) {
  var depths = getDepthsSize(node);
  var largest = 0;
  for (var i = 0; i < depths.length; i++) {
    if (depths[i] > largest)
      largest = depths[i];
  }
  return largest;
}

function getDepthsSize(node) {
  var depths = [];
  for (var i = 0; i < node.descendants().length; i++) {
    depths[node.descendants()[i].depth] ? depths[node.descendants()[i].depth] += 1 : depths[node.descendants()[i].depth] = 1;
  }
  return depths;
}

function separation(a, b) {
  return a.parent == b.parent ? 1 : 1;
}

function markPath(d) {
  root.each(function(node) {
    node.nodeInPath = false;
    //link.inPath = false;
  });

  updatedLinks = root.links();

  // Mark nodes in path back to root and select marked nodes for styling
  d.path(root).forEach(function(node) {
    node.nodeInPath = true;
    if (node.parent) {
      updatedLinks.forEach(function(link) {
        if (link.target.data.name === node.data.name) {
          link.linkInPath = true;
        }
      });
    }
  });

  // Style hovered node
  d3.select(this).classed('selected', true);

  // Move datebar
  dateBar.select('line')
    .transition()
    .attr('x1', function() { return d.y; })
    .attr('x2', function() { return d.y; });

  update();
}

function releasePath(d) {
  d.path(root).forEach(function(node) {
    node.nodeInPath = false;
    //link.inPath = false;
  });

  d3.select(this)
    .classed('selected', false);

  update();
}

// https://stackoverflow.com/questions/10359003/getting-the-documents-width-and-height
function getWindowHeight() {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;

  return y;
};
