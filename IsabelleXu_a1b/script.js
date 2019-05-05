/*globals alert, document, d3, console*/
// These keep JSHint quiet if you're using it (highly recommended!)
console.log("script loaded");
changeData();
document.getElementById("staircaseBtn").addEventListener("click", staircase);
document.getElementById("dataset").addEventListener("change", changeData);
document.getElementById("random").addEventListener("change", randomSubset);

addHover();

function addHover() {
    // PART IV hover effect Javascript
    let bars = document.getElementsByTagName("rect");
    let i;
    for (i = 0; i < bars.length; i++) {
        let curr = bars[i];
        let oldColor = curr.getAttribute("fill");
        curr.addEventListener("mouseover",function() {
            curr.setAttribute("fill", "red");
        });

        curr.addEventListener("mouseout",function() {
            curr.setAttribute("fill", oldColor);
        });
    }
}

function staircase() {
    //console.log("staircase btn pressed");
    // ****** TODO: PART II ******
    var main = document.getElementById('barChartOne');
    var children = main.getElementsByTagName('rect');
    var i;
    var widths = new Array(children.length);
    //console.log(widths.length);
    // loop through every bar in chart
    for (i = 0; i < children.length; ++i) {
        widths[i] = parseInt(children[i].getAttribute('width'));
    }
    // sort array, smallest to largest
    widths.sort(function (a, b) {
        return a - b;
    });
    //console.log(widths);
    i = 0;
    for (i = 0; i < children.length; ++i) {
        children[i].setAttribute("width", widths[i]);
    }
}

function update(error, data) {
    //console.log("update func");
    if (error !== null) {
        alert("Couldn't load the dataset!");
    } else {
        // D3 loads all CSV data as strings;
        // while Javascript is pretty smart
        // about interpreting strings as
        // numbers when you do things like
        // multiplication, it will still
        // treat them as strings where it makes
        // sense (e.g. adding strings will
        // concatenate them, not add the values
        // together, or comparing strings
        // will do string comparison, not
        // numeric comparison).

        // We need to explicitly convert values
        // to numbers so that comparisons work
        // when we call d3.max()
        data.forEach(function (d) {
            d.a = parseInt(d.a);
            d.b = parseFloat(d.b);
        });
    }

    // Set up the scales
    var aScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.a;
        })])
        .range([0, 180]);
    var bScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.b;
        })])
        .range([0, 180]);
    var iScale = d3.scaleLinear()
        .domain([0, data.length])
        .range([0, 180]);

    // ****** TODO: PART III (you will also edit in PART V) ******

    // TODO: Select and update the 'a' bar chart bars
    let y1 = -15;
    var barOne = d3.select("#barChartOne").selectAll('rect')
        .data(data)
        .transition()
        .delay(function(d, i) { return i / 5 * 200 })
        .attr("width", function (d) {
            //console.log(aScale(d.a));
            return aScale(d.a);
        })
        .attr("height", 14)
        .attr("y", function () {
            y1 += 15;
            return y1;
        });

    d3.select("#barChartOne").selectAll('rect')
        .data(data).exit().remove();
    // remove unneeded bars
    d3.select("#barChartOne").selectAll('rect')
        .data(data)
        .enter().append("rect") // add bars if needed
        .transition()
        .delay(function(d, i) { return i / 5 * 200 })
        .attr("height", 14)
        .attr("width", function (d) {
            //console.log(aScale(d.a));
            return aScale(d.a);
        })
        .attr("y", function () {
            y1 += 15;
            return y1;
        });
    addHover();

    // TODO: Select and update the 'b' bar chart bars
    let y2 = -15;
    d3.select("#barChartTwo").selectAll('rect')
        .data(data)
        .transition()
        .delay(function(d, i) { return i / 5 * 200 })
        .attr("width", function (d) {
            // console.log(aScale(d.b));
            return bScale(d.b);
        })
        .attr("height", 14)
        .attr("y", function (d) {
            y2 += 15;
            return y2;
        });

    d3.select("#barChartTwo").selectAll('rect')
        .data(data).exit().remove();
    // remove unneeded bars
    d3.select("#barChartTwo").selectAll('rect')
        .data(data)
        .enter().append("rect") // add bars if needed
        .transition()
        .delay(function(d, i) { return i / 5 * 200 })
        .attr("height", 14)
        .attr("width", function (d) {
            //console.log(aScale(d.a));
            return bScale(d.b);
        })
        .attr("y", function () {
            y2 += 15;
            return y2;
        });

    addHover();

    // TODO: Select and update the 'a' line chart path using this line generator
    var aLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.a);
        });

    d3.select("#lineChartOne").selectAll('path')
        .data(data)
        .transition()
        .duration(1000)
        .ease(d3.easeCircle)
        .attr("d", aLineGenerator(data));

    // TODO: Select and update the 'b' line chart path (create your own generator)
    var bLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return bScale(d.b);
        });

    d3.select("#lineChartTwo").selectAll('path')
        .data(data)
        .transition()
        .duration(1000)
        .ease(d3.easeCircle)
        .attr("d", bLineGenerator(data));

    // TODO: Select and update the 'a' area chart path using this line generator
    var aAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.a);
        });

    d3.select("#areaChartOne").selectAll('path')
        .data(data)
        .transition()
        .duration(1000)
        .ease(d3.easeBounce)
        .attr("d", aAreaGenerator(data));

    // TODO: Select and update the 'b' area chart path (create your own generator)
    var bAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return bScale(d.b);
        });

    d3.select("#areaChartTwo").selectAll('path')
        .data(data)
        .transition()
        .duration(1000)
        .ease(d3.easeBounce)
        .attr("d", bAreaGenerator(data));

    // TODO: Select and update the scatterplot points
    var scatter = d3.select("#scatterplot").selectAll('circle')
        .data(data)
        .on("click", function(d) {
            console.log("(" + d.a + "," + d.b +")");
        });

    scatter
        .transition()
        .duration(1000)
        .ease(d3.easeExp)
        .attr("cx", function (d) {
            return aScale(d.a);
        })
        .attr("cy", function (d) {
            return bScale(d.b);
        });


    // ****** TODO: PART IV ******
    // log x and y when scatterplot point clicked ^^^
    d3.select("#scatterplot").selectAll('circle')
        .data(data).exit().remove();
    // remove unneeded bars
    var newScatter = d3.select("#scatterplot").selectAll('circle')
        .data(data)
        .enter().append("circle") // add bars if needed
        .attr("cx", function (d) {
            return aScale(d.a);
        })
        .attr("cy", function (d) {
            return bScale(d.b);
        })
        .attr("r", "5")
        .on("click", function(d) {
            console.log("(" + d.a + "," + d.b +")");
        });

    newScatter
        .transition()
        .duration(1000)
        .ease(d3.easeExp)
        .attr("cx", function (d) {
            return aScale(d.a);
        })
        .attr("cy", function (d) {
            return bScale(d.b);
        });

}


function changeData() {
    // // Load the file indicated by the select menu
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        randomSubset();
    } else {
        d3.csv('data/' + dataFile + '.csv', update);
    }
}

function randomSubset() {
    // Load the file indicated by the select menu,
    // and then slice out a random chunk before
    // passing the data to update()
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        d3.csv('data/' + dataFile + '.csv', function (error, data) {
            var subset = [];
            data.forEach(function (d) {
                if (Math.random() > 0.5) {
                    subset.push(d);
                }
            });
            update(error, subset);
        });
    } else {
        changeData();
    }
}