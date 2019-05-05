// Parse that data from the txt file of stories
let finalData = [];
let filteredLine = "";

// words associated with each theme
let prideData = [];
let humData = [];
let peaceData = [];
let vioData = [];
let linePromises = [];

let mainChart;
let pieChart;

// promise .then callback chain (to ensure every array is being filled)
getWords("pride")
    .then(() => getWords("humility")
        .then(() => getWords("peace")
            .then(() => getWords("violence").then(() => process()))));

// Call Datamuse API to find words used for comparison w/ our text for the 4 categories
function getWords(word) {
    return fetch("http://api.datamuse.com/words?ml=" + word + "&max=700")  // by default GET
        .then(response => response.json())
        .then(function (data) {
            if (word === "pride") {
                prideData = data;
            } else if (word === "humility") {
                humData = data;
            } else if (word === "peace") {
                peaceData = data;
            } else {
                vioData = data;
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

/* lists out selectable stories (or all) */
function initVis(data) {
    let prev = "";
    // Init story selector with all stories
    $("#selector").append("<option value='ALL'>ALL</option>" );
    let i;
   for(i = 0; i < data.length; i++) {
       let title = data[i].story;
       if (title !== prev && title !== "") { // only allow unique titles
           $("#selector").append("<option value='" + title + "'>" + title + "</option>" );
       }
       prev = title;

    }

}

function loadCharts(){
    //debugger;
    // fill charts with data depending on what is selected
    let selectedStory = document.getElementById("selector").value;
    if (selectedStory !== '') {
        if (selectedStory === "ALL") {
            mainChart.updateVis(finalData);
            pieChart.updateVis(finalData);
        } else {
            console.log(selectedStory);
            let data = finalData.filter(function(d) { return d.story === selectedStory});
            //console.log(data);
            // pass data into main chart
            mainChart.updateVis(data);
            pieChart.updateVis(data);
        }

    }
}

// checks if input string is a story title
function isTitle(d) {
    if (d === d.toUpperCase() && d !== "") {
        return true;
    }
}

// parse and analyze each word in the line
function parseLine(data, currStory, line) {
    let words = line.split(" ");
    for (let i = 0; i < words.length; i++) {
        let curr = words[i];
        if (curr != null && curr !== "") {
            curr.replace(/[^0-9a-zA-Z]/g, ''); // remove any nonalphanumeric chars
            let count = getWordCount(data,curr);

            curr = curr.toLowerCase();
            // grab matching data objects from filtered data
            let pr = getObj(curr, prideData);
            let hu = getObj(curr, humData);
            let pe = getObj(curr, peaceData);
            let vi = getObj(curr, vioData);

            let type = "";
            let score = 0;
            let pos = [];
            // if any of these results have no match, set score for that category as 0
            if (pr !== 0) {
                //console.log(pr);
                type = "pride";
                score = +pr.score;
                pos = pr.tags;
            } else if (hu !== 0) {
                //console.log(hu);
                type = "humility";
                score = +hu.score;
                pos = hu.tags;
            } else if (pe !== 0) {
                //console.log(pe);
                type = "peace";
                score = +pe.score;
                pos = pe.tags;
            } else if (vi !== 0) {
                //console.log(vi);
                type = "violence";
                score = +vi.score;
                pos = vi.tags;
            }

            if (score !== 0 && currStory !== " ") {
                // gets word count of that word in a particular story
                let cs = currStory.replace(/\s+/g, '');
                let prom = d3.text("englishfairytales/"+ cs+".txt").then(function (data) {
                    //console.log(data);
                    //console.log(word);
                    let re = new RegExp(curr, 'gi');
                    let count = data.match(re).length;
                    //console.log(count);
                    let scount = count;
                    // check if word already exists in array
                    let newObj = // create new object
                        {
                            "word": curr,
                            "story": currStory,
                            "count": count,
                            "storyCount": scount,
                            "type": type,
                            "score": score,
                            "pos": pos
                        };
                    if (!getObj(curr, finalData)) {
                        finalData.push(newObj);
                    }
                });
                linePromises.push(prom);


            }

        }
    }
}


function process() {
    d3.text("englishfairytales/englishfairytales.txt").then(function (data) {
        let lineData = data.split(/\r?\n/);
        //console.log(lineData);
        var titles = [];
        var currStory = "";
        // for every line in text
        let i;
        for(i = 0 ;i<lineData.length; i++) {
            let line = lineData[i];
            filteredLine = ""; // reset for next line
            if (isTitle(line)) {
                titles.push(line);
                currStory = line; // keep track of current story
            } else {
                // strip line of unneeded words
                let filteredLine = filterCommonWords(line);
                // process words in this line
                filteredLine.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""); // get rid of all punctuation
                parseLine(data, currStory, filteredLine);

            }
        }
        // MUST WAIT UNTIL ALL LINES ARE PARSED
        Promise.all(linePromises).then(function() {
            mainChart = new ScatterPlotMain(finalData, "ALL");
            // create corresponding pie chart
            pieChart = new Pie(finalData, "ALL");
            initVis(finalData);
            display();
            document.getElementById("selector").addEventListener("change",loadCharts);
            document.getElementById("content").style.display = 'block'; // only show content after data is loaded
            document.getElementById("loader").style.display = "none";
        });
    });

}

function display() {
    console.log("Displaying now");
    loadCharts();

}

// returns the object with the key matching the inputted word
function getObj(word, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].word === word) {
            return arr[i];
        }
    }
    // no match
    return 0;
}

// Count num times word showed up in data
function getWordCount(arr,word) {
    return arr.split(word).length - 1;
}

// referenced from https://stackoverflow.com/questions/49655135/javascript-regex-remove-multiple-words-from-string
function filterCommonWords(txt) {
    var expStr = commonWords.join("|");
    return txt.replace(new RegExp('\\b(' + expStr + ')\\b', 'gi'), ' ')
        .replace(/\s{2,}/g, ' ');
}

const commonWords = ["a", "able", "about", "across", "after", "all", "almost", "also", "am",
    "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can",
    "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for",
    "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however",
    "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may",
    "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on",
    "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since",
    "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this",
    "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which",
    "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your", "ain't", "aren't",
    "can't", "could've", "couldn't", "didn't", "doesn't", "don't", "hasn't", "he'd", "he'll", "he's",
    "how'd", "how'll", "how's", "i'd", "i'll", "i'm", "i've", "isn't", "it's", "might've", "mightn't",
    "must've", "mustn't", "shan't", "she'd", "she'll", "she's", "should've", "shouldn't", "that'll",
    "that's", "there's", "they'd", "they'll", "they're", "they've", "wasn't", "we'd", "we'll", "we're",
    "weren't", "what'd", "what's", "when'd", "when'll", "when's", "where'd", "where'll", "where's", "who'd",
    "who'll", "who's", "why'd", "why'll", "why's", "won't", "would've", "wouldn't", "you'd", "you'll",
    "you're", "you've", "very", "more"];



