angular
  .module('boundry.analytics')
  .factory('HeatMapFactory', HeatMapFactory)
  .factory('AnalyticsFactory', AnalyticsFactory);

AnalyticsFactory.$inject = ['HeatMapFactory'];

function AnalyticsFactory(HeatMapFactory) {
  console.log(google.maps);
  console.log(google.maps.drawing);
  console.log(google.maps.visualization);
  var lineChartData = {};
  var barChartData = {};
  var preprocessedSampleData = HeatMapFactory.preprocessedSampleData;
  var regions = ['sampleRegion1', 'sampleRegion2', 'sampleRegion3', 'sampleRegion4'];

	function prepareLineChartData() {
		var objectOfRegionData = filterDataByRegion(preprocessedSampleData);
    console.log('objectOfRegionData', objectOfRegionData);
		updateAllLineChartData(objectOfRegionData);
	}

  function prepareBarChartData() {
    var objectOfRegionData = filterDataByRegion(preprocessedSampleData);
    console.log('objectOfRegionData', objectOfRegionData);
    updateAllBarChartData(objectOfRegionData);
  }

	// filter data by region
	function filterDataByRegion(dataArray) {
		var objectOfRegionData = {};
		for (var i = 0; i < dataArray.length; i++) {
			if (!objectOfRegionData[dataArray[i].region]) {
				objectOfRegionData[dataArray[i].region] = [];
			}
			objectOfRegionData[dataArray[i].region].push(dataArray[i]);
		}
		return objectOfRegionData;
	}

  function updateAllLineChartData(dataObject) {
    for (var region in dataObject) {
      lineChartData[region] = generateLineChartData(dataObject[region]);
    }
    console.log('lineChartData', lineChartData);
  }

  function updateAllBarChartData(dataObject) {
    for (var region in dataObject) {
      barChartData[region] = generateBarChartData(dataObject[region]);
    }
    console.log('barChartData', barChartData);
  }

  function generateLineChartData(dataArray) {
    var objectOfEachTime = {};
    var processedArray = [];

    _.each(dataArray, function(element) {
      if (objectOfEachTime[element.timestamp]) {
        objectOfEachTime[element.timestamp]++;
      } else {
        objectOfEachTime[element.timestamp] = 1;
      }
    });

    for (var time in objectOfEachTime) {
      var temp = [];
      temp.push(parseInt(time));
      temp.push(objectOfEachTime[time]);
      processedArray.push(temp);
    }

    return processedArray;
  }

  function generateBarChartData(dataArray) {
    var objectOfEachTime = {};
    var processedArray = [];

    _.each(dataArray, function(element) {
      if (objectOfEachTime[element.timestamp]) {
        objectOfEachTime[element.timestamp]++;
      } else {
        objectOfEachTime[element.timestamp] = 1;
      }
    });

    return objectOfEachTime;
  }

	function numberOfUniqueUsers(dataArray) {
		var users = {};
		_.each(dataArray, function(element) {
			if (!users[element.userId]) {
				users[element.userId] = true;
			}
		});
		return Object.keys(users).length;
	}

	function filterDataByHour(hour, dataArray) {
		var filteredData = _.filter(dataArray, function(element){
			return hour <= element.timestamp && element.timestamp < (hour+1);
		});
		return filteredData;
	}

  var originalFilteredLineChartData = {};

  function renderLineChart(rangeArray) {
    var min = rangeArray[0];
    var max = rangeArray[1];
    var finalData = views[0].data;

    for (var i = 0; i < finalData.length; i++) {
      console.log('thing to filter', lineChartData[finalData[i].key]);
      var filteredData = _.filter(lineChartData[finalData[i].key], function(tuple) {
        var time = tuple[0];
        return (min <= time && time <= max);
      });
      finalData[i].values = filteredData;
    }
    console.log('finalData', finalData);
  }

  function renderBarChart(time) {
    var finalData = views[1].data[0].values;
    console.log('finalDatafinalData', finalData);
    for (var i = 0; i < finalData.length; i++) {
      finalData[i].value = barChartData[finalData[i].label][time];
    }
  }


	// filter data by time interval min < time < max
	function filterDataByTimeInterval(dataArray, min, max) {
		var filteredArray = [];
		for (var i = 0; i < dataArray.length; i++) {
			if (min <= dataArray[i].timestamp && dataArray[i].timestamp < max) {
				filteredArray.push(dataArray[i]);
			}
		}
		return filteredArray;
	}

  function changeMinutesToHour(minutes) {

    var time = changeToModTwelve( Math.floor(minutes/60) ) + //hour
    ':' +
    pad( minutes % 60 ) + //minutes
    determineAmOrPm( Math.floor(minutes/60) );
    
    function pad(n) {
        return (n < 10) ? ('0' + n) : n;
    }

    function changeToModTwelve(number) {
      if (number === 0 || number === 12 || number === 24) {
        return 12;
      } else {
        return number % 12;
      }
    }

    function determineAmOrPm(number) {
      if ( (0 <= number && number < 12) || number === 24) {
        return 'AM';
      } else if (12 <= number && number < 24) {
        return 'PM';
      }
    }

    return time;
  }

	var views = [{
      name: 'Line Chart',
      options: {
            chart: {
                type: 'lineChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 65
                },
                x: function(d){ return d[0]; },
                y: function(d){ return d[1]; },
                average: function(d) { return d.mean; },

                color: d3.scale.category10().range(),
                transitionDuration: 1,
                useInteractiveGuideline: true,
                clipVoronoi: false,

                xAxis: {
                    axisLabel: 'Time',
                    tickFormat: function(d) {
                      return changeMinutesToHour(d);
                    	// return d3.format('')(d);
                        // return d3.time.format('%m/%d/%y')(new Date(d));
                    },
                    showMaxMin: false,
                    staggerLabels: true
                },

                yAxis: {
                    axisLabel: '# People',
                    tickFormat: function(d){
                        return d3.format('')(d);
                    },
                    axisLabelDistance: 20,
                    showMaxMin: false
                }
                // xDomain: [0, 24]
            }
        },
      data: [
            {
                key: 'Lands End Stage',
                values: [
                ],
                mean: 7
            },
            {
                key: 'McLaren Pass',
                values: [
                ],
                mean: 12
            },
            {
                key: 'Twin Peaks Stage',
                values: [
                ],
                mean: 12
            }
        ]
    },
    {
      name: 'Bar Chart',
      options: {
        chart: {
          type: 'discreteBarChart',
          height: 450,
          margin : {
              top: 20,
              right: 20,
              bottom: 60,
              left: 55
          },
          x: function(d){ return d.label; },
          y: function(d){ return d.value; },
          showValues: true,
          valueFormat: function(d){
              return d3.format(',.0f')(d);
          },
          transitionDuration: 50,
          xAxis: {
              axisLabel: 'X Axis'
          },
          yAxis: {
              axisLabel: 'Y Axis',
              axisLabelDistance: 30
          }
        }
      },
      data: [{
        key: 'Cumulative Return',
        values: [
            { 'label' : 'Lands End Stage' , 'value' : 22 },
            { 'label' : 'McLaren Pass' , 'value' : 4 },
            { 'label' : 'Twin Peaks Stage' , 'value' : 28 }
            ]
        }]
    },
    {
      name: 'Heat Map'
    }];
  return {views: views,
  	regions: regions,
  	filterDataByRegion: filterDataByRegion,
  	filterDataByTimeInterval: filterDataByTimeInterval,
    prepareLineChartData: prepareLineChartData,
  	prepareBarChartData: prepareBarChartData,
    renderLineChart: renderLineChart,
    renderBarChart: renderBarChart}; 
}



function HeatMapFactory() {
	var map, heatmap, pointArray;

	var sampleData = processData(preprocessedSampleData);

// fetch data for event

//rerender with filteredData
  function renderHeatmap(timePoint){
    var filteredData = filterDataByTime(timePoint, preprocessedSampleData);
    var processedData = processData(filteredData);
    pointArray = new google.maps.MVCArray(processedData);
    var oldHeatmap = heatmap;
    heatmap = new google.maps.visualization.HeatmapLayer({
      data: pointArray
    });

    heatmap.setMap(map);

    setTimeout(function() {oldHeatmap.setMap(null);}, 50);
  }

// filter data
	function filterDataByTime(timePoint, dataArray) {
		var filteredData = _.filter(dataArray, function(element){
			return (timePoint - 1/2) <= element.timestamp && element.timestamp < (timePoint + 1/2);
      //1 is the bucket size
		});
		return filteredData;
	}

// takes in array tuples, [[lat,long]]
	function processData(dataArray) {
		var outputArray = [];
		for (var i = 0; i < dataArray.length; i++) {
			var dataPoint = new google.maps.LatLng(dataArray[i].latitude, dataArray[i].longitude);
			outputArray.push(dataPoint);
		}
		return outputArray;
	}


	function initialize() {
	  var mapOptions = {
	    zoom: 15,
	    center: new google.maps.LatLng(37.769696, -122.489298),
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  };

	  map = new google.maps.Map(document.getElementById('map'),
	      mapOptions);

	  pointArray = new google.maps.MVCArray(sampleData);

	  heatmap = new google.maps.visualization.HeatmapLayer({
	    data: pointArray
	  });

	  heatmap.setMap(map);
	}

	var initializeOnce = _.once(initialize);

	function toggleHeatmap() {
	  heatmap.setMap(heatmap.getMap() ? null : map);
	}

	function changeGradient() {
	  var gradient = [
	    'rgba(0, 255, 255, 0)',
	    'rgba(0, 255, 255, 1)',
	    'rgba(0, 191, 255, 1)',
	    'rgba(0, 127, 255, 1)',
	    'rgba(0, 63, 255, 1)',
	    'rgba(0, 0, 255, 1)',
	    'rgba(0, 0, 223, 1)',
	    'rgba(0, 0, 191, 1)',
	    'rgba(0, 0, 159, 1)',
	    'rgba(0, 0, 127, 1)',
	    'rgba(63, 0, 91, 1)',
	    'rgba(127, 0, 63, 1)',
	    'rgba(191, 0, 31, 1)',
	    'rgba(255, 0, 0, 1)'
	  ];
	  heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
	}

	function changeRadius() {
	  heatmap.set('radius', heatmap.get('radius') ? null : 20);
	}

	function changeOpacity() {
	  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
	}

  // google.maps.event.addDomListener(window, 'load', initialize);

  return {
  	initialize: initialize,
  	initializeOnce: initializeOnce,
  	toggleHeatmap: toggleHeatmap,
  	changeGradient: changeGradient,
  	changeRadius: changeRadius,
  	changeOpacity: changeOpacity,
  	renderHeatmap: renderHeatmap,
  	preprocessedSampleData: preprocessedSampleData
  }; 
}