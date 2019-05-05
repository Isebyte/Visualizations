/*
    Pie chart showing the total count of a word in regards to the entire story data
 */

class Pie {
    constructor(data, name) {
        var self = this;
        self.data = data; // story data
        self.name = name; // story name
        self.margin = {top: 30, right: 20, bottom: 30, left: 50};
        self.radius = 150;
        self.init();
    }

    init() {
        console.log("init Pie");
        var self = this;
        // Gets access to the div element created for this chart from HTML
        self.svgWidth = 400 - self.margin.left - self.margin.right;

        self.piechart = d3.select("#piechart");
        //console.log(self.piechart);
        // creates svg element within the div
        self.svg = self.piechart
            .append("svg")
            .attr("width", self.svgWidth)
            .attr("height",self.svgWidth)
            .append("g")
            .attr("class", "slices")
            .attr("transform", "translate(" + self.svgWidth/2 + "," + self.svgWidth/2 +")");


        self.arc = d3.arc()
            .outerRadius(self.radius - 10)
            .innerRadius(0);

        // ------------ append legend -----------------
        // referenced from https://bl.ocks.org/jkeohan/b8a3a9510036e40d3a4e
        var svgLegend = d3.select(".legend4").append("svg")
            .attr("width", self.svgWidth)
            .attr("height", 30);

        var dataLeg = 0;
        var offset = 80;

        var legendVals = ["Peace", "Violence", "Humility","Pride"];
        var color = ['#47d147','#ffd633','#3288bd','#d53e4f'];

        var legend = svgLegend.selectAll('.legend')
            .data(legendVals)
            .enter().append('g')
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                if (i === 0) {
                    dataLeg = d.length + offset;
                    return "translate(0,0)"
                }

                let newdata = dataLeg;
                dataLeg +=  d.length + offset;
                return "translate(" + (newdata) + ",0)"

            });

        legend.append('rect')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function (d, i) {return color[i];});

        legend.append('text')
            .attr("x", 20)
            .attr("y", 10)
            .text(function (d) {return d;})
            .style("text-anchor", "start")
            .style("font-size", 15)

    }


    separateData() {
        var self = this;
        let fdata = [];
        let words = ["humility", "pride", "peace", "violence"];
        let i;
        for (i = 0 ; i<words.length ; i++) {
            fdata.push(self.data.filter(function(d) { return d.type === words[i]}));
        }

        return fdata;
    }

    arcTween(a) {
        let self = this;
        console.log(self._current);
        var i = d3.interpolate(self._current, a);
        self._current = i(0);
        return function(t) {
            return arc(i(t));
        };
    }

    updateVis(data) {
        console.log("Updating pie");
        let self = this;
        self.data = data;

        let sData = self.separateData();
        //console.log(sData);
        // get total count in each category
        let totalCounts = [];
        let i;
        for (i = 0; i < sData.length; i++) {
            let j;
            let c = 0;
            let w = [];
            let subarr = sData[i];
            //console.log(subarr);
            for(j = 0; j < subarr.length; j++) {
               c += subarr[j].storyCount;
               w.push(subarr[j].word)
            }
            if (subarr[0] !== undefined) {
                let newObj = {
                    "type": subarr[0].type,
                    "words": w,
                    "totalCount": c,
                    "story": self.name
                };
                totalCounts.push(newObj);
            }
        }

        self.colorScale = d3.scaleOrdinal()
            .domain(["Peace", "Violence", "Humility","Pride"])
            .range(['#3288bd','#d53e4f','#47d147','#ffd633' ]);

        self.pie = d3.pie()
            .value(function(d) { return d.totalCount; })(totalCounts);

        var tip = d3.tip()
            .attr("class", "d3-tip")
            .html(function(d) {
                return "<strong>Total Frequency:</strong> <span>" + d.totalCount + "</span><br>" +
                        "<strong>Category:</strong> <span>" + d.type + "</span><br>" +
                        "<strong>Story:</strong> <span>" + d.story + "</span>";

            });

        self.svg.call(tip);

        // join new data
        var arcs = self.svg.selectAll("arc")
            .data(self.pie,
        function(d) {
            return d.data.key
        });

        arcs
            .transition()
            .duration(function(d, i) {
                return i * 800;
            })
            .attrTween("d", self.arcTween);

        // enter
        arcs.enter()
            .append("path")
            .transition()
            .duration(function(d, i) {
                return i * 800;
            })
            .style("fill", function(d) {
                return self.colorScale(d.data.type);
            })
            .attr("d", self.arc)
            .each(function(d) {
                self._current = d;
            });

        // ------- Update stats section ----------

        // get total count of all sections
        let h;
        let totalCount = 0; // int value
        for(h = 0; h < totalCounts.length; h++) {
            totalCount += totalCounts[h].totalCount;
        }



        if(totalCounts[0] !== undefined) {
            document.getElementById("humility").innerHTML =
                "Humility: " + Math.round(totalCounts[0].totalCount * 10000 / totalCount) / 100 + "% or "
                + totalCounts[0].totalCount + "/" + totalCount + " words";
        } else {
            document.getElementById("humility").innerHTML =
                "Humility: " + 0/ 100 + "% or "
                +0 + "/" + totalCount + " words";
        }

        if(totalCounts[1] !== undefined) {
            document.getElementById("pride").innerHTML =
                "Pride: " + Math.round(totalCounts[1].totalCount * 10000 / totalCount) / 100 + "% or "
                + totalCounts[1].totalCount + "/" + totalCount + " words";
        } else {
            document.getElementById("pride").innerHTML =
                "Pride: " +0 / 100 + "% or "
                + 0 + "/" + totalCount + " words";
        }

        if(totalCounts[2] !== undefined) {
            document.getElementById("peace").innerHTML =
                "Peace: " + Math.round(totalCounts[2].totalCount * 10000 / totalCount) / 100 + "% or "
                + totalCounts[2].totalCount + "/" + totalCount + " words";
        } else {
            document.getElementById("peace").innerHTML =
                "Peace: " +0/ 100 + "% or "
                + 0+ "/" + totalCount + " words";
        }

        if(totalCounts[3] !== undefined){
            document.getElementById("violence").innerHTML =
                "Violence: " + Math.round(totalCounts[3].totalCount*10000/totalCount)/100+  "% or "
                + totalCounts[3].totalCount + "/" + totalCount+ " words";
        } else {
            document.getElementById("violence").innerHTML =
                "Violence: " + 0+  "% or "
                + 0 + "/" + totalCount+ " words";
        }


        // get largest
        let l = {
            "type": "",
            "words": "",
            "totalCount": 0,
            "story": self.name
        };
        let ties = [];
        for(i = 0; i < totalCounts.length; i++) {
            if (totalCounts[i].totalCount > l.totalCount) {
                l = totalCounts[i];
            } else if (totalCounts[i].totalCount === l.totalCount) {
                ties.push(totalCounts[i]);
                ties.push(l);
            }
        }

        document.getElementById("overall").innerHTML = l.type;



    }

}