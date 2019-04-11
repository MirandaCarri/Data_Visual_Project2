//the svg size
var width = 585,
  height = 575;
//scaling the font
var minFont = 18,
  maxFont = 40;
var leaderScale = d3.scaleLinear().range([minFont, maxFont]);
// the color sheme of the cloud
var fill = function(i) {
  return d3.schemeCategory20[i % 20];
};
// data on map on cloud will be defaulted to 1970 data
updateData(1970);

//will update the cloud depending on the year entered
function updateData(year) {
  //import csv file
  d3.csv("data/GlobalTerrorismDbNew.csv", function(data) {
    //will arrange data from years and the countries in those years 
    var peopleTargeted = d3
      .nest()
      .key(function(d) {
        return d.iyear;
      })
      .key(function(d) {
        return d.natlty1_txt;
      })
      .rollup(function(v) {
        return v.length;
      })
      .entries(data);
    // this will change year to the index
    var theIndex;
    if (year <= 1992) {
      theIndex = year - 1970;
    } else {
      theIndex = year - 1970 - 1;
    }

    var testData = [];
    //create the year to country list 
    for (let i = 0; i < peopleTargeted[theIndex].values.length; i++) {
      testData.push({
        text: peopleTargeted[theIndex].values[i].key,
        size: peopleTargeted[theIndex].values[i].value
      });
    }
    //create the font scale 
    leaderScale.domain([
      d3.min(testData, function(d) {
        return d.size;
      }),
      d3.max(testData, function(d) {
        return d.size;
      })
    ]);
    //will call the draw cloud function and initialize first cloud drawn
    d3.layout
      .cloud()
      .size([width, height])
      .words(testData)
      .padding(0)
      .rotate(function() {
        return ~~(Math.random() * 2) * 90;
      })
      .font("Impact")
      .fontSize(function(d) {
        return leaderScale(d.size);
      })
      .on("end", drawCloud)
      .start();
  });
}
//attaches this to html code to display cloud
var g = d3
  .select("#word-cloud")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
//will redrawCloud when new words enter or exit
function drawCloud(words) {
  var svg = g.selectAll("text").data(words);
  //Enter new words
  svg
    .enter()
    .append("text")
    .style("font-size", function(d) {
      return d.size + "px";
    })
    .style("font-family", "Impact")
    .style("fill", function(d, i) {
      return fill(i);
    })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
      return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(function(d) {
      return d.text;
    });
  // exit words
  svg
    .exit()
    .style("fill-opacity", 1.0)
    .transition()
    .duration(200)
    .style("fill-opacity", 1e-6)
    .attr("font-size", 1)
    .remove();
  //helps the transtions between new clouds
  svg
    .transition()
    .duration(750)
    .style("font-size", function(d) {
      return leaderScale(d.value);
    })
    .attr("transform", function(d) {
      return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(d => d.text)
    .style("fill-opacity", 1);
}
