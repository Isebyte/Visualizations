/**
 * Constructor for the ElectoralVoteChart
 *
 * @param brushSelection an instance of the BrushSelection class
 */
function ElectoralVoteChart() {

    var self = this;
    self.init();
}

/**
 * Initializes the svg elements required for this chart
 */
ElectoralVoteChart.prototype.init = function () {
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 100;

    //creates svg element within the div
    self.svg = divelectoralVotes.append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
ElectoralVoteChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R") {
        return "republican";
    } else if (party == "D") {
        return "democrat";
    } else if (party == "I") {
        return "independent";
    }
};

/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */

ElectoralVoteChart.prototype.update = function (electionResult, colorScale) {
    var self = this;

    // ******* TODO: PART II *******
    var data = electionResult;
    data.forEach(function (d) {
        d.D_Percentage = +d.D_Percentage;
        d.R_Percentage = +d.R_Percentage;
        d.I_Percentage = +d.I_Percentage;
        d.Total_EV = +d.Total_EV;
    });
    //Group the states based on the winning party for the state;
    //then sort them based on the margin of victory
    const DemoData = [];
    const RepData = [];
    const IndeData = [];
    for (let d of data) {
        if (d.D_Percentage > d.R_Percentage) {
            if (d.I_Percentage > d.D_Percentage) {
                IndeData.push(d);
            } else {
                DemoData.push(d);
            }
        } else if (d.D_Percentage === d.R_Percentage) {
            if (d.I_Percentage > d.D_Percentage) {
                IndeData.push(d);
            } else {
                RepData.push(d);
            }
        } else if (d.R_Percentage > d.D_Percentage) {
            if (d.I_Percentage > d.R_Percentage) {
                IndeData.push(d);
            } else {
                RepData.push(d);
            }
        }
    }
    DemoData.sort((a, b) => (a.R_Percentage - a.D_Percentage) - (b.R_Percentage - b.D_Percentage)); //largest to smallest
    RepData.sort((a, b) => (a.R_Percentage - a.D_Percentage) - (b.R_Percentage - b.D_Percentage)); //smallest to largest
    const d = IndeData.concat(DemoData);
    const AllData = d.concat(RepData);
    console.log(AllData);

    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .electoralVotes class to style your bars.

    var x = self.margin.left;
    const padding = 4.2;
    var indeIndex = 0;
    var demoIndex = 0;
    var repIndex = 0;
    //update
    self.svg.selectAll("rect")
        .data(AllData)
        .attr("x", function (d) {
            if(d === IndeData[0]){
                indeIndex = x;
            } else if (d === DemoData[0]) {
                demoIndex = x;
            } else if (d === RepData[RepData.length-1]) {
                repIndex = x-30;
            }
            var temp = x;
            x += d.Total_EV+padding;
            return temp;
        })
        .attr("y", self.margin.top)
        .attr("width", function (d) {
            return d.Total_EV+padding;
        })
        .attr("height", 20)
        .attr("fill", function (d) {
            if ((d.I_Percentage > d.R_Percentage) && d.I_Percentage > d.D_Percentage) {
                return "green";
            }
            var m = d.R_Percentage - d.D_Percentage;
            return colorScale(m);
        })
        .attr("class", "electoralVotes");

    x = self.margin.left;
    self.svg.selectAll("rect")
        .data(AllData)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            if(d === IndeData[0]){
                indeIndex = x;
            } else if (d === DemoData[0]) {
                demoIndex = x;
            } else if (d === RepData[RepData.length-1]) {
                repIndex = x-30;
            }
            var temp = x;
            x += d.Total_EV+padding;
            return temp;
        })
        .attr("y", self.margin.top)
        .attr("width", function (d) {
            return d.Total_EV+padding;
        })
        .attr("height", 20)
        .attr("fill", function (d) {
            if ((d.I_Percentage > d.R_Percentage) && d.I_Percentage > d.D_Percentage) {
                return "green";
            }
            var m = d.R_Percentage - d.D_Percentage;
            return colorScale(m);
        })
        .attr("class", "electoralVotes");
    //exit
    self.svg.selectAll("rect").exit().remove(); // remove unneeded rects

    //Display total count of electoral votes won by the Democrat and Republican party
    //on top of the corresponding groups of bars.
    //HINT: Use the .electoralVoteText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary
    var totalInde = 0;
    var totalDemo = 0;
    var totalRep = 0;
    IndeData.forEach(function(d) {
        totalInde += d.Total_EV;
    });
    DemoData.forEach(function(d) {
        totalDemo += d.Total_EV;
    });
    RepData.forEach(function (d) {
        totalRep += d.Total_EV;
    });

    var n;
    if(IndeData.length !== 0) {
        n = indeIndex;
    } else {
        n = 0;
    }
    var textData = [{EV: totalInde, index: n, party: "I"},
        {EV: totalDemo, index: demoIndex, party: "D"},
        {EV: totalRep, index: repIndex+35, party: "R"}];

    self.svg.selectAll("text")
        .data(textData)
        .attr("x",function(d) {
            return d.index;
        })
        .attr("class", function(d) {
            return "electoralVoteText " + self.chooseClass(d.party);
        })
        .attr("y",self.margin.top-5)
        .text(function (d) {
            if (d.index === 0) {
                return "";
            }
            return d.EV;
        });

    self.svg.selectAll("text")
        .data(textData)
        .enter()
        .append("text")
        .attr("x",function(d) {
            return d.index;
        })
        .attr("class", function(d) {
            return "electoralVoteText " + self.chooseClass(d.party);
        })
        .attr("y",self.margin.top-5)
        .text(function (d) {
            if (d.index === 0) {
                return "";
            }
            return d.EV;
        });

    self.svg.selectAll("text").exit().remove();

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.
    self.svg.append("rect")
        .attr("class", "middlePoint")
        .attr("x",(self.svgWidth+30)/2)
        .attr("y",self.margin.top-5)
        .attr("width",2)
        .attr("height",30);

    //Just above this, display the text mentioning the total number of electoral votes required
    // to win the elections throughout the country
    //HINT: Use .electoralVotesNote class to style this text element
    self.svg.append("text")
        .attr("x",(self.svgWidth-this.margin.left)/2)
        .attr("y",self.margin.top-20)
        .attr("class", "electoralVotesNote")
        .text("Electoral Vote (270 needed to win)");


    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

    //******* TODO: PART V *******
    //Implement brush on the bar chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of brushSelection and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.

};
