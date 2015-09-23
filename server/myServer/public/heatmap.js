var globalData;
var logTheData = function(data){
  var hourly = hourlyAverage(data);
  globalData = hourly;
  createMap( hourly.hourlyArr, hourly.min, hourly.max );
};

var hourlyAverage = function(data){
  var hourlyArr = [];
  var thisHour = 0;
  var thisHoursSum = 0;
  var thisHoursItems = 0;
  var maxValue=0;
  var minValue=200;
  var theAverage = 60;
  //grab a weeks worth of datapoints - 10080 minutes in a week, or however many points are in data.length if its shorter than 10080
  var dataPointsToGrab = data.length > 10080 * 4 ? 10080 * 4 : data.length;
  console.log('dataPointsToGrab',dataPointsToGrab);

  for (var i = 0; i < dataPointsToGrab; i++){
    theDate = new Date(data[i].date);
    theDay = theDate.getDay();
    theHour = theDate.getHours();
    theWeek = d3.time.weekOfYear(theDate);

    if ( thisHour === theHour ) { // we haven't rolled over a new hour, if item is valid, increment hours items, add to hourssum

       if ( data[i]["heart-rate"] !== "" ) { //check to see if its not empty
          thisHoursSum = thisHoursSum + parseInt(data[i]["heart-rate"]);
          thisHoursItems++;
       }

    } else { //we have rolled over a new hour, calculate the average and add to the array, reset hoursum and hoursitems, set thisHour

      if(thisHoursSum!==0){ //if for some reason the previous hour averaged to 0, just use the average from previous hour
        theAverage = thisHoursSum / thisHoursItems ;
      }

      if ( theAverage > maxValue ) {
        maxValue = theAverage;
      } else if ( theAverage < minValue ) {
        minValue = theAverage;
      }
      //add a data point for the hour
      hourlyArr.push ( { //recreating data structure of previous example
        day: theDay,
        hour: theHour,
        week: theWeek,
        value: theAverage,
        oldDate: theDate
      } ) ;

      //reset counters
      thisHoursSum = 0;
      thisHoursItems = 0;
      thisHour = theHour;

    }
  }

  return { hourlyArr : hourlyArr, min : minValue, max : maxValue };

};

var margin = { top: 100, right: 0, bottom: 100, left: 30 },
    width = 960 - margin.left - margin.right,
    height = 2000 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 24),
    legendElementWidth = gridSize*2,
    buckets = 9,
    // colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#2ppasdfasdfasdf53494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
    // colors = ['#0001FF','#571BE8','#6E0FE8','#E41DFF', '#E80F67', '#E80F2D','#FF2C10'];
    colors = [
      '#009933',
      '#208C46',
      '#408059',
      '#60736C',
      '#806680',
      '#9F5993',
      '#BF4DA6',
      '#DF40B9',
      '#FF33CC'
    ],
    days = [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa","Su", "Mo", "Tu", "We", "Th", "Fr", "Sa",  "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa","Su", "Mo", "Tu", "We", "Th", "Fr", "Sa",'Su','Mo'],
    // days = [];
    times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];

  //this is the original data input format
  // d3.tsv("data.  tsv",
  //   function(d) {
  //     return {
  //       day: +d.day,
  //       hour: +d.hour,
  //       value: +d.value
  //     };
  //   },
var createMap = function( data, min, max ) {
  // var weeksInData = d3.select("#weekBox")
  //     .data( d3.set( d3.time.weekOfYear( data.oldDate ).values( ) ) )
  //     .append("option")
  //     .attr('id','32')
  //     .attr('class','weeks')
  //     .text("text","weekbox");

  console.log('creatingMap');

  var colorScale = d3.scale.quantile()
      .domain([min, d3.max(data, function (d) { return d.value; })])
      .range(colors);

  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("style", "outline: none")
      .append("g") //
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var heatMap = svg.selectAll(".hour")
      .data(data)
      .enter().append("rect")
        .attr("x", function(d) { return ( d.hour ) * gridSize; })
        .attr("y", function(d) { 
          // console.log('theday',( d.week - data[0].week) * 7 + d.day , 'data[0].week', data[0].week);
          return ( (  d.week - data[0].week ) * 7 + d.day ) * gridSize; })
        // .attr("y", function(d) { return (d3.time.weekOfYear(d.oldDate) % 7 ) * gridSize; })
        .attr("rx", 0)
        .attr("ry", 0)
        .attr("class", "hour ")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", function(d) {
          // return colors[Math.floor(Math.random()*9)];
          return colors[9];
        });

        heatMap.append("svg:title")
        .text(function(d) { return d.oldDate; });
  // days[0] = data[0].week;
  // data.forEach(function(d){
  //   if
  // });

  heatMap.transition().duration( 3000 )
      .style("fill", function(d) { return colorScale(d.value); });

  // heatMap.append("title").text(function(d) { return d.value; });  // this doesn't appear to be functional

  var dayLabels = svg.selectAll(".dayLabel")
      .data(days)
      .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize; })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

  var timeLabels = svg.selectAll(".timeLabel")
      .data(times)
      .enter().append("text")
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return i * gridSize; })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });


  //create legend svg
  var legend = svg.selectAll(".legend")
      .data([0].concat(colorScale.quantiles()), function(d) { return d; })
      .enter().append("g")
        .attr("class", "legend");

  legend.append("rect")
    .attr("x", function(d, i) { return legendElementWidth * i + 100 ; })
    // .attr("y", height)
    .attr ( "y", -60 )
    .attr("width", legendElementWidth)
    .attr("height", gridSize / 2)
    .style("fill", function(d, i) { return colors[i]; });

  legend.append("text")
    .attr("class", "mono")
    .text(function(d) { return "≥ " + Math.round(d); })
    .attr("x", function(d, i) { return legendElementWidth * i + 100; })
    // .attr("y", height + gridSize);
    .attr( 'y', -75 );
};

//The g element is a container used to group objects. Transformations applied to the g element are performed on 
//all of its child elements. Attributes applied are inherited by child elements. In addition, it can be used to 
//define complex objects that can later be referenced with the <use> element.



