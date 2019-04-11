// Width and height
var chart_width     =   800;
var chart_height    =   550;
var color           =   d3.scaleQuantize().range([
    'rgb(255,245,240)', 'rgb(254,224,210)', 'rgb(252,187,161)',
    'rgb(252,146,114)', 'rgb(251,106,74)', 'rgb(239,59,44)',
    'rgb(203,24,29)', 'rgb(165,15,21)', 'rgb(103,0,13)'
]);

// create the years that is avaible to select
var years = [];

for (var i = 1970; i < 2018; i ++) {
    if(i !== 1993 ) {
        years.push(i);
    }
};

// Projection
var projection      =   d3.geoMercator() 
    .translate([ 0,0 ]);
var path            =   d3.geoPath( projection );

// Create SVG
var svg             =   d3.select("#chart")
    .append("svg")
    .attr("width", chart_width)
    .attr("height", chart_height);

var zoom_map        =   d3.zoom()
    .scaleExtent([ 0.04, 30.0 ])
    .translateExtent([
        [ -50000, -10000 ],
        [  50000,  10000 ]
    ])
    .on( 'zoom', function(){
    var offset      =   [
        d3.event.transform.x,
        d3.event.transform.y
    ];
    var scale       =   d3.event.transform.k * 2000;

    projection.translate( offset )
        .scale( scale );

    svg.selectAll( 'path' )
        .transition()
        .attr( 'd', path );

    svg.selectAll( 'circle' )
        .transition()
        .attr( "cx", function(d) {
            return projection([d.lon, d.lat])[0];
        })
        .attr( "cy", function(d) {
            return projection([d.lon, d.lat])[1];
        });
});

var map             =   svg.append( 'g' )
    .attr( 'id', 'map' )
    .call( zoom_map )
    .call(
        zoom_map.transform,
        d3.zoomIdentity
            .translate( chart_width / 2, chart_height / 2 + 100 )
            .scale( 0.06 )
    );

map.append( 'rect' )
    .attr( 'x', 0 )
    .attr( 'y', 0 )
    .attr( 'width', chart_width )
    .attr( 'height', chart_height )
    .attr( 'opacity', 0 );

// add buttons
var buttons         =   d3.select('#user-input-div')
        .append('div')
        .attr('class','years_buttons')
        .selectAll('button')
        .data(years)
        .enter()
        .append('button')
        .text(function(d) {
            return d;
        })
        .attr('class','year-button')
        .attr('id',function(d){
            return 'i' + d;
        })
        .on('click', function(d){
            // reset/update the buttons
            d3.selectAll('.year-button')
                .transition()
                .duration(500)
                .style('background','rgb(240, 149, 64)');

            // redraw the button
            d3.select(this)
                .transition()
                .duration(500)
                .style('background','green')
                .style('color','white');
            update(d);
            updateData(d);
        });
        

// set up play button
d3.select('#play-button').on('click',function(){
    play_animation();
    d3.select('#pause-button').attr('disabled',null);
});

// set up pause button
d3.select('#pause-button').on('click',function(){
    stop_animation();
}).attr('disabled','disabled')

// Data
d3.csv('data/GlobalTerrorismDbNew.csv', function(terror_data){
    sorted_Terror_data     =         d3.nest()
                                        .key(function(d) {
                                            return d.iyear;
                                        })
                                        .key(function(d){
                                            return d.natlty1_txt;
                                        })
                                        .rollup(function(leaves) { // getting the amount of number the nation get for a year
                                            return leaves.length;
                                        })
                                        .entries(terror_data);

    // console.log(sorted_Terror_data[0].values);                                        
    
    color.domain([
        d3.min( sorted_Terror_data[0].values, function(d){
            return d.value;
        }),
        d3.max( sorted_Terror_data[0].values, function(d){
            return d.value;
        })
    ]);

        d3.json( 'data/countriesLowRes.geo.json', function( world_data ){
            world_data.features.forEach(function(w_e, w_i){
                sorted_Terror_data[0].values.forEach(function(t_e,t_i){ //! Need work
                    if( w_e.properties.name !== t_e.key ){
                        return null;
                    }

                    world_data.features[w_i].properties.num   =   parseFloat(t_e.value);
                });
            });

            map.selectAll( 'path' )
                .data( world_data.features )
                .enter()
                .append( 'path' )
                .attr( 'd', path )
                .attr( 'fill', function( d ){
                    var num         =   d.properties.num;
                    return num ? color( num ) : 'rgb(122, 122, 122)';
                })
                .attr( 'stroke', '#000' )
                .attr( 'stroke-width', 1 )
                .on("mouseover", function(d) { 
                    tooltip.transition()    
                    .duration(200)    
                    .style("opacity", .9);    
                    tooltip.html(d.properties.name + '</br>#Times Targeted: ' + function(){
                        if(d.properties.num !== undefined){
                            return d.properties.num
                        } else {
                            return 0;
                        }
                    }())  
                    .style("left", (d3.event.pageX) + "px")   
                    .style("top", (d3.event.pageY - 28) + "px");  
                  })          
                  .on("mouseout", function(d) {   
                    tooltip.transition()    
                    .duration(200)    
                    .style("opacity", 0); 
                  });
        });
});

// add tooltip
var tooltip = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

// update map function
function update(year){
    d3.csv('data/GlobalTerrorismDbNew.csv', function(terror_data){
        // prepare data
        sorted_terror_data           =         d3.nest()
                                            .key(function(d) {
                                                return d.iyear;
                                            })
                                            .key(function(d){
                                                return d.natlty1_txt;
                                            })
                                            .rollup(function(leaves) { // getting the amount of number the nation get for a year
                                                return leaves.length;
                                            })
                                            .entries(terror_data);
        // filter out the year
        var filtered_terror_data        =   sorted_terror_data.filter(function(d){return parseInt(d.key) == year;});

        var selected_year_terror_data   = filtered_terror_data[0].values;

        // console.log(selected_year_terror_data);

        // update color domain
        color.domain([
            d3.min( selected_year_terror_data, function(d){
                return d.value;
            }),
            d3.max( selected_year_terror_data, function(d){
                return d.value;
            })
        ]);

        // put data into map data
        d3.json( 'data/countriesLowRes.geo.json', function( world_data ){
            world_data.features.forEach(function(w_e, w_i){
                selected_year_terror_data.forEach(function(t_e,t_i){ 
                    if( w_e.properties.name !== t_e.key ){
                        return null;
                    }

                    world_data.features[w_i].properties.num   =   parseFloat(t_e.value);
                });
            });

        
            // select all the paths that makes up the map
            var paths                       =   map.selectAll('path')
                                                    .data(world_data.features);

            paths
            .transition()
            .duration(750)
            .attr( 'd', path )
            .attr( 'fill', function( d ){
                var num         =   d.properties.num;
                return num ? color( num ) : 'rgb(122, 122, 122)';
            })
            .attr( 'stroke', '#000' )
            .attr( 'stroke-width', 1 );
            // draw the current years data onto map                                                
                                                
        }); 

        d3.select('.chart-title')
        .text('Nationality Targeted By Terrorist in ' + year);

        // update legend
        updateLegend(color.domain())

    });

}

// animate through all the years
var year_interval;
function play_animation(){
    var year_idx = 0;

    // disable buttons
    d3.selectAll('.year-button')
        .attr('disabled','disabled');

    d3.selectAll('#play-button')
        .attr('disabled','disabled');

    year_interval = setInterval(function() {

        update(years[year_idx]);
        updateData(years[year_idx])

        year_idx++;

        if(year_idx >= years.length) {
            clearInterval(year_interval)
            // Enable the button
            d3.selectAll('.year-button')
                .attr('disabled',null);

            d3.selectAll('#play-button')
                .attr('disabled',null);
        }

    }, 1500);
};
function stop_animation(){
    clearInterval(year_interval)
    // Enable the button
    d3.selectAll('.year-button')
        .attr('disabled',null);

    d3.selectAll('#play-button')
        .attr('disabled',null);
    //disable pause button
    d3.select('#pause-button')
        .attr('disabled','disabled');
}

d3.selectAll( '#buttons button.panning' ).on( 'click', function(){
    var x           =   0;
    var y           =   0;
    var distance    =   100;
    var direction   =   d3.select( this ).attr( 'class' ).replace( 'panning ', '' );

    if( direction === "up" ){
        y           +=  distance; // Increase y offset
    }else if( direction === "down" ){
        y           -=  distance; // Decrease y offset
    }else if( direction === "left" ){
        x           +=  distance; // Increase x offset
    }else if( direction === "right" ){
        x           -=  distance; // Decrease x offset
    }

    map.transition()
        .call( zoom_map.translateBy, x, y );
});

d3.selectAll( '#buttons button.zooming' ).on( 'click', function(){
    var scale       =   1;
    var direction   =   d3.select(this).attr("class").replace( 'zooming ', '' );

    if( direction === "in" ){
        scale       =  1.25;
    }else if(direction === "out"){
        scale       =  0.75;
    }

    map.transition()
        .call(zoom_map.scaleBy, scale);
});

        
//! Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
function updateLegend(colorDomain){
    console.log('updating');
    var legendText = ["300+ times targeted", "1+ times targeted", "Not targeted"];
    var legend = d3.select(".legend")

        legend.selectAll("text")
            .data(colorDomain.slice().reverse())
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
                .text(function(d) { return d + ' times targeted'; });
    
}

var legendText = ["580 times targeted", "1 times targeted", "Not targeted"];
var legend = d3.select("#chart").append("svg")
      			.attr("class", "legend")
     			.attr("width", 200)
    			.attr("height", 85)
   				.selectAll("g")
   				.data(color.domain().slice().reverse())
   				.enter()
   				.append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height",18)
        .style("fill", color);

  	legend.append("text")
  		  .data(legendText)
      	  .attr("x", 24)
      	  .attr("y", 9)
      	  .attr("dy", ".35em")
            .text(function(d) { return d; });

    d3.select('.legend')
        .style('position','relative')
        .style('top','-65px')
        .style('left','25px');

