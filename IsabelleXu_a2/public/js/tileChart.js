/**
 * Constructor for the TileChart
 */
function TileChart(){

    var self = this;
    self.init();
}

/**
 * Initializes the svg elements required to lay the tiles
 * and to populate the legend.
 */
TileChart.prototype.init = function(){
    var self = this;

    //Gets access to the div element created for this chart and legend element from HTML
    var divTileChart = d3.select("#tiles").classed("content", true);
    var legend = d3.select("#legend").classed("content",true);
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    var svgBounds = divTileChart.node().getBoundingClientRect();
    self.svgWidth = svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = self.svgWidth/1.5;
    var legendHeight = 70;

    //creates svg elements within the div
    self.legendSvg = legend.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",legendHeight)
        .attr("transform", "translate(" + self.margin.left + ",0)");

    self.svg = divTileChart.append("svg")
                        .attr("width",self.svgWidth)
                        .attr("height",self.svgHeight)
                        .attr("transform", "translate(" + self.margin.left + ",0)")
                        .style("bgcolor","green")

};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
TileChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party== "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
};

/**
 * Renders the HTML content for tool tip.
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for tool tip
 */
TileChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<h2 class ="  + self.chooseClass(tooltip_data.winner) + " >" + tooltip_data.state + "</h2>";
    text +=  "Electoral Votes: " + tooltip_data.electoralVotes;
    text += "<ul>";
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });
    text += "</ul>";
    return text;
};

/**
 * Creates tiles and tool tip for each state, legend for encoding the color scale information.
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
TileChart.prototype.update = function(electionResult, colorScale){
    var self = this;

    //Calculates the maximum number of columns to be laid out on the svg
    self.maxColumns = d3.max(electionResult,function(d){
                                return parseInt(d["Space"]);
                            });

    //Calculates the maximum number of rows to be laid out on the svg
    self.maxRows = d3.max(electionResult,function(d){
                                return parseInt(d["Row"]);
                        });

    var data = electionResult;

    data.forEach(function (d) {
        d.D_Votes = +d.D_Votes;
        d.R_Votes = +d.R_Votes;
        d.I_Votes = +d.I_Votes;
        d.D_Percentage = +d.D_Percentage;
        d.R_Percentage = +d.R_Percentage;
        d.I_Percentage = +d.I_Percentage;
        d.Total_EV = +d.Total_EV;

    });

    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    var tip = d3.tip().attr('class', 'd3-tip')
        .direction('se')
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
            /* populate data in the following format
             * tooltip_data = {
             * "state": State,
             * "winner":d.State_Winner
             * "electoralVotes" : Total_EV
             * "result":[
             * {"nominee": D_Nominee_prop,"votecount": D_Votes,"percentage": D_Percentage,"party":"D"} ,
             * {"nominee": R_Nominee_prop,"votecount": R_Votes,"percentage": R_Percentage,"party":"R"} ,
             * {"nominee": I_Nominee_prop,"votecount": I_Votes,"percentage": I_Percentage,"party":"I"}
             * ]
             * }
             * pass this as an argument to the tooltip_render function then,
             * return the HTML content returned from that method.
             * */
            var winner = "";
            if (d.D_Percentage > d.R_Percentage) {
                if (d.D_Percentage > d.I_Percentage) {
                    winner = "D";
                } else {
                    winner = "I";
                }
            } else {
                if (d.R_Percentage > d.I_Percentage) {
                    winner = "R";
                } else {
                    winner = "I";
                }
            }
            if (d.I_Nominee == null || d.I_Nominee=== "") {
                iNom = "N/A";
            } else {
                console.log(d.I_Nominee);
                iNom = d.I_Nominee;
            }
            var tooltip_data = {
                "state": d.State,
                "winner":winner,
                "electoralVotes" : d.Total_EV,
                "result":[
                    {"nominee": d.D_Nominee, "votecount": d.D_Votes, "percentage": d.D_Percentage, "party": "D"},
                    {"nominee": d.R_Nominee, "votecount": d.R_Votes, "percentage": d.R_Percentage, "party": "R"},
                    {"nominee": iNom, "votecount": d.I_Votes, "percentage": d.I_Percentage, "party": "I"}
                ]
            };
            if (d.State == null) {
                tooltip_data = {
                    "state": "N/A",
                    "winner":"N/A",
                    "electoralVotes" : "N/A",
                    "result":[
                        {"nominee": "N/A", "votecount": "N/A", "percentage":"N/A", "party": "D"},
                        {"nominee": "N/A", "votecount": "N/A", "percentage": "N/A", "party": "R"},
                        {"nominee": "N/A", "votecount": "N/A", "percentage": "N/A", "party": "I"}
                    ]
                };
            }
            return self.tooltip_render(tooltip_data);
        });

    //Creates a legend element and assigns a scale that needs to be visualized
    self.legendSvg.append("g")
        .attr("class", "legendQuantile");

    var legendQuantile = d3.legendColor()
        .shapeWidth(self.svgWidth/15)
        .shapeHeight(10)
        .cells(10)
        .orient('horizontal')
        .scale(colorScale);

    // ******* TODO: PART IV *******
    //Transform the legend element to appear in the center and make a call to this element for it to display.
    self.legendSvg.selectAll(".legendQuantile")
        .style('transform', 'translate(5%,0)')
        .call(legendQuantile);

    var states = [["AK","","","","","","","","","","","ME"],
                ["","","","","","","","","","","VT","NH"],
                ["","WA","ID","MT","ND","MN","IL","WI","MI","NY","RI","MA"],
                ["","OR","NV","WY","SD","IA","IN","OH","PA","NJ","CT",""],
                ["","CA","UT","CO","NE","MO","KY","WV","VA","MD","DC",""],
                ["","","AZ","NM","KS","AR","TN","NC","SC","DE","",""],
                ["","","","","OK","LA","MS","AL","GA","","",""],
                ["","HI","","","TX","","","","","FL","",""]];
    var statesData = [];
    //Lay rectangles corresponding to each state according to the 'row' and 'column' information in the data.
    var rectWidth = 65;
    var rectHeight = 55;
    var xpos = 1;
    var ypos = 1;
    states.forEach(function(rows) {
        var r = [];
        rows.forEach(function(col) {
            var match = {};
            if (col === ""){
                match.Abbreviation = "";
                match.row = xpos;
                match.col = ypos;
                r.push(match);
            } else {
                //console.log(col);
                match = data.find(obj => {
                    return obj.Abbreviation === col;
                });
                if (match == null) {
                    match = {};
                    match.Abbreviation = col;
                    match.Total_EV = 0;
                }
                console.log(match);
                match.row = xpos;
                match.col = ypos;
                r.push(match);
            }
            xpos += rectWidth;
        });
        xpos = 1; // reset
        ypos += rectHeight;
        statesData.push(r);
    });
    console.log(statesData);
    var margin = 0;
    var row = self.svg.selectAll(".row")
        .data(statesData)
        .attr("class", "row");
    self.svg.call(tip);
    row.selectAll(".tile")
        .data(function(d) { return d; })
        .attr("class","tile")
        .attr("x", function(d) { return d.row; })
        .attr("y", function(d) { return d.col; })
        .attr("width", rectWidth  - margin)
        .attr("height", rectHeight  - margin)
        .attr("fill", function (d) {
            if (d.Abbreviation === "") return "white";
            if (d.Total_EV === 0) return "LightGray";
            if ((d.I_Percentage > d.R_Percentage) && d.I_Percentage > d.D_Percentage) {
                return "green";
            }
            var m = d.R_Percentage - d.D_Percentage;
            return colorScale(m);
        })
        .on('mouseover', function(d, i){
            if (d.Abbreviation !== "") {
                console.log("tip");
                tip.show(d,i);
            }
        })
        .on('mouseout',  tip.hide);

    row = self.svg.selectAll(".row")
        .data(statesData)
        .enter().append("g")
        .attr("class", "row");

    row.selectAll(".tile")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class","tile")
        .attr("x", function(d) { return d.row; })
        .attr("y", function(d) { return d.col; })
        .attr("width", rectWidth - margin)
        .attr("height", rectHeight - margin)
        .attr("fill", function (d) {
            if (d.Abbreviation === "") return "white";
            if (d.Total_EV === 0) return "LightGray";
            if ((d.I_Percentage > d.R_Percentage) && d.I_Percentage > d.D_Percentage) {
                return "green";
            }
            var m = d.R_Percentage - d.D_Percentage;
            return colorScale(m);
        })
        .on('mouseover', function(d, i){
            if (d.Abbreviation !== "") {
                console.log("tip");
                tip.show(d,i);
            }
        })
        .on('mouseout',  tip.hide);

    //Display the state abbreviation and number of electoral votes on each of these rectangles
    var rowt = self.svg.selectAll(".rowt")
        .data(statesData)
        .attr("class", "rowt");

    rowt.selectAll(".tilestext,.ev")
        .data(function(d) { return d; })
        .attr("x", function(d) { return d.row + rectWidth/2; })
        .attr("y", function(d) { return d.col+rectHeight/1.3; })
        .attr("class", "tilestext ev")
        .text(function (d) {
            return d.Total_EV;
        });

    rowt = self.svg.selectAll(".rowt")
        .data(statesData)
        .enter().append("g")
        .attr("class", "rowt");

    rowt.selectAll(".tilestext,.ev")
        .data(function(d) { return d; })
        .enter().append("text")
        .attr("x", function(d) { return d.row + rectWidth/2; })
        .attr("y", function(d) { return d.col+rectHeight/1.3; })
        .attr("class", "tilestext ev")
        .text(function (d) {
            return d.Total_EV;
        });


    var rowstate = self.svg.selectAll(".rowstate")
        .data(statesData)
        .attr("class", "rowstate");

    rowstate.selectAll(".tilestext,.state")
        .data(function(d) { return d; })
        .attr("x", function(d) { return d.row + rectWidth/2; })
        .attr("y", function(d) { return d.col+rectHeight/2; })
        .attr("class", "tilestext state")
        .text(function (d) {
            return d.Abbreviation;
        });

    rowstate = self.svg.selectAll(".rowstate")
        .data(statesData)
        .enter().append("g")
        .attr("class", "rowstate");

    rowstate.selectAll(".tilestext,.state")
        .data(function(d) { return d; })
        .enter().append("text")
        .attr("x", function(d) { return d.row + rectWidth/2; })
        .attr("y", function(d) { return d.col+rectHeight/2; })
        .attr("class", "tilestext state")
        .text(function (d) {
            return d.Abbreviation;
        });



    self.svg.selectAll(".tilestext,.ev").exit().remove();
    self.svg.selectAll(".tilestext,.state").exit().remove();

    self.svg.selectAll(".row").exit().remove(); // remove unneeded rects
    self.svg.selectAll(".state").exit().remove(); // remove unneeded rects



    //Use global color scale to color code the tiles.

    //HINT: Use .tile class to style your tiles;
    // .tilestext to style the text corresponding to tiles

    //Call the tool tip2 on hover over the tiles to display stateName, count of electoral votes
    //then, vote percentage and number of votes won by each party.
    //HINT: Use the .republican, .democrat and .independent classes to style your elements.
};
