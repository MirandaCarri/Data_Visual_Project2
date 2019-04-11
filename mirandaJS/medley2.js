


var width = 585,
    height = 575;
var minFont = 18, maxFont = 40;
var leaderScale = d3.scaleLinear().range([minFont,maxFont]);

 //var fill = d3.scale.category20();
var fill = function(i){
  return d3.schemeCategory20[i%20];
}


   updateData(1970);


//  //add buttons

//  var years = [];

//  for(i=1970; i<=2017; i++){
//   if (i!=1993){
//     years.push(i);
//   }
//  };
//  console.log(years);
// // debugger;

// var buttons  =   d3.select('#user-input-div')

//         .append('div')

//         .attr('class','years_buttons')

//         .selectAll('button')

//         .data(years)

//         .enter()

//         .append('button')

//         .text(function(d) {

//             return d;

//         })

//         .attr('class','year-button')

//         .attr('id',function(d){

//             return 'i' + d;

//         })

//         .on('click', function(d){

//             // reset/update the buttons

//             d3.selectAll('.year-button')

//                 .transition()

//                 .duration(500)

//                 .style('background','rgb(240, 149, 64)');



//             // redraw the button

//             d3.select(this)

//                 .transition()

//                 .duration(500)

//                 .style('background','green')

//                 .style('color','white');

// //             update(d);
//               updateData(d);

//         });

function updateData(year){

   d3.csv("data/GlobalTerrorismDbNew.csv", function(data) {

 var peopleTargeted = d3.nest()
              .key(function(d) { return d.iyear; })
              .key(function(d) { return d.natlty1_txt; })
              .rollup(function(v) { return v.length; })
              .entries(data);

            // console.log(peopleTargeted);

   // console.log(peopleTargeted[0].values[0].values);


  var theIndex;
  if(year <=1992){
    theIndex = year - 1970;
  } else{
    theIndex = (year - 1970) - 1;
  }
  
  var testData = [];
  //console.log(testData);

  for(let i = 0; i < peopleTargeted[theIndex].values.length; i++) {
    // console.log(weapons[0].values[i].key); 
     testData.push({text: peopleTargeted[theIndex].values[i].key ,size: peopleTargeted[theIndex].values[i].value});
    // console.log('country: ' +weapons[0].values[i].key + ' size: '+ weapons[0].values[i].values);
  }
    leaderScale.domain([
      d3.min(testData,function(d) { return d.size; }),
      d3.max(testData, function(d) { return d.size; })
      ]);

    console.log(testData);

     d3.layout.cloud().size([width, height])
      .words(testData)
      .padding(0)
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .font("Impact")
      .fontSize(function(d) {  return leaderScale(d.size); })
      .on("end", drawCloud)
      .start();
    });
}


var g = d3.select("#word-cloud").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate("+(width/2)+","+(height/2)+")");

  function drawCloud(words) {

    console.log(words);

    
    var svg = g.selectAll("text")
        .data(words);

      svg
      .enter().append("text")
        .style("font-size", function(d) {return d.size + "px";  })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });

      svg.exit()
          .style('fill-opacity', 1.0)
          .transition()
          .duration(200)
          .style('fill-opacity', 1e-6)
          .attr('font-size', 1)
          .remove();

        svg
        .transition()
          .duration(750)
          .style("font-size", function(d) {
            return leaderScale(d.value)
          })
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(d=>d.text)
          .style("fill-opacity", 1);

        



  }



