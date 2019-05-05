/**
 * Constructor for the Vote Percentage Chart
 */
function VotePercentageChart(){

    var self = this;
    self.init();
}

/**
 * Initializes the svg elements required for this chart
 */
VotePercentageChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};
    var divvotesPercentage = d3.select("#votes-percentage").classed("content", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divvotesPercentage.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 100;

    //creates svg element within the div
    self.svg = divvotesPercentage.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
VotePercentageChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party == "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
};

/**
 * Renders the HTML content for tool tip
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for toop tip
 */
VotePercentageChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<ul>";
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });

    return text;
};

/**
 * Creates the stacked bar chart, text content and tool tips for Vote Percentage chart
 *
 * @param electionResult election data for the year selected
 */
VotePercentageChart.prototype.update = function(electionResult){
    var self = this;
    var data = electionResult;

    // vote and percentage calculations
    var indeVotes = 0;
    var demoVotes = 0;
    var repVotes = 0;

    data.forEach(function (d) {
        d.D_Votes = +d.D_Votes;
        d.R_Votes = +d.R_Votes;
        d.I_Votes = +d.I_Votes;
        d.Total_EV = +d.Total_EV;

        // get total votes for each state
        indeVotes += d.I_Votes;
        demoVotes += d.D_Votes;
        repVotes += d.R_Votes;
    });

    var totalVotes = indeVotes + demoVotes + repVotes;
    var iP = indeVotes*100/totalVotes;
    var dP = demoVotes*100/totalVotes;
    var rP = repVotes*100/totalVotes;
    console.log("inde per:" + iP);
    console.log("demo per: " + dP);
    console.log("rep per: " + rP);

    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    tip = d3.tip().attr('class', 'd3-tip')
        .direction('s')
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
            /* populate data in the following format
             * tooltip_data = {
             * "result":[
             * {"nominee": D_Nominee_prop,"votecount": D_Votes_Total,"percentage": D_PopularPercentage,"party":"D"} ,
             * {"nominee": R_Nominee_prop,"votecount": R_Votes_Total,"percentage": R_PopularPercentage,"party":"R"} ,
             * {"nominee": I_Nominee_prop,"votecount": I_Votes_Total,"percentage": I_PopularPercentage,"party":"I"}
             * ]
             * }
             * pass this as an argument to the tooltip_render function then,
             * return the HTML content returned from that method.
             * */
            var iNom;
            if (data[0].I_Nominee === "" || data[0].I_Votes === 0) {
                iNom = "N/A";
            } else {
                iNom = data[0].I_Nominee;
            }

            var tooltip_data = {
                "result":[
                    {"nominee": data[0].D_Nominee, "votecount": demoVotes, "percentage": Math.round(dP), "party": "D"},
                    {"nominee": data[0].R_Nominee, "votecount": repVotes, "percentage": Math.round(rP), "party": "R"},
                    {"nominee": iNom, "votecount": indeVotes, "percentage": Math.round(iP), "party": "I"}
                ]
            };
            return self.tooltip_render(tooltip_data);
        });


    // ******* TODO: PART III ******

    var percentData = [{party: "I" , percent: iP, votes:indeVotes, nominee: data[0].I_Nominee},
        {party: "D", percent: dP, votes: demoVotes, nominee: data[0].D_Nominee},
        {party: "R", percent: rP, votes:repVotes, nominee: data[0].R_Nominee}];

    var padding = 0;
    var largest = Math.max(iP+padding,dP+padding,rP+padding);
    console.log(largest);
    var widthScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, self.svgWidth-(this.margin.left+30)]);

    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .votesPercentage class to style your bars.
    var x = self.margin.left;
    self.svg.call(tip);
    self.svg.selectAll("rect")
        .data(percentData)
        .attr("x", function(d) {
            var temp = x;
            x += widthScale(d.percent);
            return temp;
        })
        .attr("y", self.margin.top)
        .attr("width", function (d) {
            return widthScale(d.percent);
        })
        .attr("fill", function(d) {
            if (d.party === "D") return "#0066cc";
            if (d.party === "R") return "#ff3333";
            if (d.party === "I") return "green";
        })
        .attr("height", 20)
        .attr("class", "votesPercentage")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
    //Call the tool tip on hover over the bars to display stateName, count of electoral votes.
    //then, vote percentage and number of votes won by each party.

    // enter data
    self.svg.selectAll("rect")
        .data(percentData)
        .enter()
        .append("rect")
        .attr("x", function(d) {
            var temp = x;
            x += widthScale(d.percent);
            return temp;
        })
        .attr("y", self.margin.top)
        .attr("width", function (d) {
            return widthScale(d.percent);
        })
        .attr("fill", function(d) {
            if (d.party === "D") return "#0066cc";
            if (d.party === "R") return "#ff3333";
            if (d.party === "I") return "green";
        })
        .attr("height", 20)
        .attr("class", "votesPercentage")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    self.svg.selectAll("rect").exit().remove(); // remove unneeded rects


    //Display the total percentage of votes won by each party
    //on top of the corresponding groups of bars.
    //HINT: Use the .votesPercentageText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary
    x = self.margin.left;
    var i = false;
    self.svg.selectAll("text")
        .data(percentData)
        .attr("x",function(d) {
            if(d.party === "R") return widthScale(100)+50;
            if (d.party === "I" && d.votes > 0) i = true;
            if(d.party === "D" && i === true) return x+15;
            var temp = x;
            x += widthScale(d.percent);
            return temp;
        })
        .attr("class", function(d) {
            return "electoralVoteText " + self.chooseClass(d.party);
        })
        .attr("y",self.margin.top-5)
        .text(function (d) {
            if (d.percent === 0) {
                return "";
            }
            return Math.round( d.percent* 10 ) / 10 +"%";
        });
    x = self.margin.left;
    i = false;
    self.svg.selectAll("text")
        .data(percentData)
        .enter()
        .append("text")
        .attr("x",function(d) {
            if(d.party === "R") return widthScale(100)+50;
            if (d.party === "I" && d.votes > 0) i = true;
            if(d.party === "D" && i === true) return x+15;
            var temp = x;
            x += widthScale(d.percent);
            return temp;
        })
        .attr("class", function(d) {
            return "electoralVoteText " + self.chooseClass(d.party);
        })
        .attr("y",self.margin.top-5)
        .text(function (d) {
            if (d.percent === 0) {
                return "";
            }
            return Math.round( d.percent* 10 ) / 10 +"%";
        });

    // append nominee names
    var xn = self.margin.left+10;
    self.svg.selectAll(".nom")
        .data(percentData)
        .attr("x",function(d) {
            if(d.party === "R") return widthScale(100);
            var temp = xn;
            if (d.party ==="D") {
                temp = xn+120;
            }
            xn += widthScale(d.percent);
            return temp;
        })
        .attr("class", function(d) {
            return "nom electoralVoteText " + self.chooseClass(d.party);
        })
        .attr("y",self.margin.top-19)
        .text(function (d) {
            if (d.percent === 0) {
                return "";
            }
            return d.nominee;
        });
    xn = self.margin.left+10;

    self.svg.selectAll(".nom")
        .data(percentData)
        .enter()
        .append("text")
        .attr("x",function(d) {
            if(d.party === "R") return widthScale(100);
            var temp = xn;
            if (d.party ==="D") {
                temp = xn+120;
            }
            xn += widthScale(d.percent);
            return temp;
        })
        .attr("class", function(d) {
            return "nom electoralVoteText " + self.chooseClass(d.party);
        })
        .attr("y",self.margin.top-19)
        .text(function (d) {
            if (d.percent === 0) {
                return "";
            }
            return d.nominee;
        });

    self.svg.selectAll("text").exit().remove();
    self.svg.selectAll(".nom").exit().remove();

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.
    self.svg.append("rect")
        .attr("class", "middlePoint")
        .attr("x",(self.svgWidth-(self.margin.left-60))/2)
        .attr("y",self.margin.top-5)
        .attr("width",2)
        .attr("height",30);

    //Just above this, display the text mentioning details about this mark on top of this bar
    //HINT: Use .votesPercentageNote class to style this text element
    self.svg.append("text")
        .attr("x",self.svgWidth/2)
        .attr("y",self.margin.top-6)
        .attr("class", "votesPercentageNote")
        .text("Popular Vote (50%)");


    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

};
