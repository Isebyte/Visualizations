/*
    Configures and draws the main scatter plot chart
 */

class ScatterPlotMain {
    constructor(data, name) {
        var self = this;
        self.data = data; // story data
        self.name = name; // story name
        self.margin = {top: 30, right: 20, bottom: 30, left: 50};
        self.padding = 50;
        self.init();

    }

    init() {
        //console.log("Init scatterplot");
        var self = this;

        self.scatterplot = d3.select("#scatterMain");

        // Gets access to the div element created for this chart from HTML
        self.svgWidth = 700 - self.margin.left - self.margin.right;

        // creates svg element within the div
        self.svg = self.scatterplot.append("svg")
            .attr("class","mainSvg")
            .attr("width",self.svgWidth)
            .attr("height",self.svgWidth);

        self.svg.append("g")
            .attr("class", "x-axis");

        self.svg.append("g")
            .attr("class", "y-axis");

        self.svg.append("text")
            .attr("x", 30)
            .attr("y", ((self.svgWidth-self.padding)/2)+20)
            .text("Pride");

        self.svg.append("text")
            .attr("x",((self.svgWidth-self.padding)) - 30)
            .attr("y", ((self.svgWidth-self.padding)/2)+20)
            .text("Humility");

        self.svg.append("text")
            .attr("transform", "translate("+(((self.svgWidth-self.padding)/2))+","+(15)+")")
            .text("Peace");

        self.svg.append("text")
            .attr("transform", "translate("+(((self.svgWidth-self.padding)/2))+"," +(self.svgWidth-self.padding + 50)+")")
            .text("Violence");

        self.updateVis(self.data);
    }

    // separate the data into 4 categories based on their category
    separateData() {
        var self = this;
        let fdata = [];
        let words = ["humility", "pride", "peace", "violence"];
        let i;
        for (i = 0 ; i<words.length ; i++) {
            fdata.push(self.data.filter(function(d) { return d.type === words[i]}));
        }

        i = 0;
        for(i = 0; i < fdata[1].length; i++) {
            let obj = fdata[1][i];
            obj.score = -Math.abs(obj.score);
            fdata[1][i] = obj; // make negative
        }
        i = 0;
        for(i = 0; i < fdata[3].length; i++) {
            let obj = fdata[3][i];
            obj.score = -Math.abs(obj.score);
            fdata[3][i] = obj; // make negative
        }

        //console.log(fdata);
        return fdata;
    }

    updateVis(data) {
        var self = this;
        self.data = data;
        let fdata = self.separateData();


        let xData = fdata[0].concat(fdata[1]);
        let yData= fdata[2].concat(fdata[3]);

        // sort data from largest to smallest by StoryCount(to make all words capable of being hovered over)
        xData.sort(function (a,b) {
            return b.storyCount -  a.storyCount;
        });

        yData.sort(function (a,b) {
            return b.storyCount - a.storyCount;
        });

        // console.log(xData);
        // console.log(yData);
        let minP = Math.min.apply(Math, xData.map(function(o) { return o.score; }));
        let maxH = Math.max.apply(Math, xData.map(function(o) { return o.score; }));
        let minV = Math.min.apply(Math, yData.map(function(o) { return o.score; }));
        let maxPe = Math.max.apply(Math, yData.map(function(o) { return o.score; }));

        let xS = maxH;
        let yS = maxPe;
        if (Math.abs(minP) > maxH) {
            xS = minP; // pride, humility
        }
        if (Math.abs(minV) > maxPe) {
            yS = minV; // violence, peace
        }

        self.xScale = d3.scaleLinear()
            .domain([-Math.abs(xS), Math.abs(xS)])
            .range([0, self.svgWidth-self.padding]);

        self.yScale = d3.scaleLinear()
            .domain([-Math.abs(yS), Math.abs(yS)])
            .range([self.svgWidth-self.padding, 0]);

        self.colorScale = d3.scaleLinear()
            .domain([-Math.abs(xS), Math.abs(xS)])
            .range(['#d53e4f', '#3288bd']);

        self.ycolorScale = d3.scaleLinear()
            .domain([-Math.abs(xS), Math.abs(xS)])
            .range(['#ffd633', '#47d147']);


        let minR;
        let maxR;
        if (self.name === "ALL") {
            minR = Math.min.apply(Math, self.data.map(function(o) { return o.count; }));
            maxR = Math.max.apply(Math, self.data.map(function(o) { return o.count; }));
        } else {
            minR = Math.min.apply(Math, self.data.map(function(o) { return o.storyCount; }));
            maxR = Math.max.apply(Math, self.data.map(function(o) { return o.storyCount; }));
        }

        // console.log(minR);
        // console.log(maxR);
        self.rScale = d3.scaleLinear()
            .domain([Math.abs(minR), Math.abs(maxR)])
            .range([10, 70]);

        // define the x axis
        var xAxis = d3.axisBottom()
            .ticks(10)
            .scale(self.xScale);

        var yAxis = d3.axisLeft()
            .ticks(10)
            .scale(self.yScale);

        // generate y and x axis
        self.svg.select(".x-axis")
            .attr("class", "x-axis") // assign an axis class
            .attr("transform", "translate(25, " + ((self.svgWidth)/2 ) + ")")
            .call(xAxis);

        self.svg.select(".y-axis")
            .attr("class", "y-axis") // assign an axis class
            .attr("transform", "translate(" + ((self.svgWidth)/2) + ", 25)")
            .call(yAxis);

        // Tooltip
        var tip = d3.tip()
            .attr("class", "d3-tip")
            .html(function(d) {
                if (self.name === "ALL") {
                    return "<strong>Word:</strong> <span>" + d.word + "</span><br>" +
                        "<strong>Total Frequency:</strong> <span>" + d.count + "</span><br>" +
                        "<strong>Category:</strong> <span>" + d.type + "</span><br>" +
                        "<strong>Score:</strong> <span>" + d.score + "</span><br>" +
                        "<strong>POS:</strong> <span>" + d.pos + "</span><br>" +
                        "<strong>Story:</strong> <span>" + d.story + "</span>";
                } else {
                    return "<strong>Word:</strong> <span>" + d.word + "</span><br>" +
                        "<strong>Total Frequency:</strong> <span>" + d.count + "</span><br>" +
                        "<strong>Story Frequency:</strong> <span>" + d.storyCount + "</span><br>" +
                        "<strong>Category:</strong> <span>" + d.type + "</span><br>" +
                        "<strong>Score:</strong> <span>" + d.score + "</span><br>" +
                        "<strong>POS:</strong> <span>" + d.pos + "</span><br>" +
                        "<strong>Story:</strong> <span>" + d.story + "</span>";
                }

            });

        self.svg.call(tip);

        // update the data
        var xCircles = self.svg.selectAll(".xCircle")
            .data(xData)
            .attr("class","xCircle")
            .attr("r", function(d) {
                if (self.name === "ALL") {
                    return self.rScale(d.count);
                }
                return self.rScale(d.storyCount);
            })
            .attr("transform", "translate(25, " + ((self.svgWidth)/2 ) + ")")
            .style("fill", function(d) { return self.colorScale(+d.score); })
            .style("opacity", 0.4)
            .attr("cx", function(d) {
                //console.log( self.xScale(+d.score));
                return self.xScale(+d.score);
            })
            .attr("cy",0)
            .on('mouseover', function(d) {
                tip.show(d);
                d3.select(this)
                    .attr('opacity', 1.0)
                    .attr('stroke','#000000')
                    .attr('stroke-width', 2);
            })
            .on('mouseout', function(d) {
                tip.hide(d);
                d3.select(this)
                    .attr('opacity', 0.4)
                    .attr('stroke-width', 0);
            });

        var yCircles = self.svg.selectAll(".yCircle")
            .data(yData)
            .attr("class","yCircle")
            .attr("r", function(d) {
                if (self.name === "ALL") {
                    return self.rScale(d.count);
                }
                return self.rScale(d.storyCount);
            })
            .attr("transform", "translate(" + ((self.svgWidth)/2) + ", 25)")
            .style("fill", function(d) { return self.ycolorScale(+d.score); })
            .style("opacity", 0.4)
            .attr("cx",0)
            .attr("cy", function(d) { return self.yScale(+d.score); })
            .on('mouseover', function(d) {
                tip.show(d);
                d3.select(this)
                    .attr('opacity', 1.0)
                    .attr('stroke','#000000')
                    .attr('stroke-width', 2);
            })
            .on('mouseout', function(d) {
                tip.hide(d);
                d3.select(this)
                    .attr('opacity', 0.4)
                    .attr('stroke-width', 0);
            });

        // console.log(minP);
        // console.log(minV);
        if (minP !== Infinity) {
            xCircles
                .data(xData)
                .enter().append("circle")
                .attr("class","xCircle")
                .attr("r", function(d) {
                    if (self.name === "ALL") {
                        return self.rScale(d.count);
                    }
                    return self.rScale(d.storyCount);
                })
                .attr("transform", "translate(25, " + ((self.svgWidth)/2 ) + ")")
                .style("fill", function(d) { return self.colorScale(+d.score); })
                .style("opacity", 0.4)
                .attr("cx", function(d) {
                    return self.xScale(+d.score);
                })
                .attr("cy",0)
                .on('mouseover', function(d) {
                    tip.show(d);
                    d3.select(this)
                        .attr('opacity', 1.0)
                        .attr('stroke','#000000')
                        .attr('stroke-width', 2);
                })
                .on('mouseout', function(d) {
                    tip.hide(d);
                    d3.select(this)
                        .attr('opacity', 0.4)
                        .attr('stroke-width', 0);
                });
        }

        if(minV !== Infinity) {
            yCircles
                .data(yData)
                .enter().append("circle")
                .attr("class","yCircle")
                .attr("r", function(d) {
                    if (self.name === "ALL") {
                        return self.rScale(d.count);
                    }
                    return self.rScale(d.storyCount);
                })
                .attr("transform", "translate(" + ((self.svgWidth)/2) + ", 25)")
                .style("fill", function(d) { return self.ycolorScale(+d.score); })
                .style("opacity", 0.4)
                .attr("cx",0)
                .attr("cy", function(d) { return self.yScale(+d.score); })
                .on('mouseover', function(d) {
                    tip.show(d);
                    d3.select(this)
                        .attr('opacity', 1.0)
                        .attr('stroke','#000000')
                        .attr('stroke-width', 2);
                })
                .on('mouseout', function(d) {
                    tip.hide(d);
                    d3.select(this)
                        .attr('opacity', 0.4)
                        .attr('stroke-width', 0);
                });

        }

        xCircles.exit().remove();
        yCircles.exit().remove();

    }


}