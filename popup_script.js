console.log("pop-up script");

// https://stackoverflow.com/questions/20028950/chrome-extension-query-tabs-async

var url, headline, time, articleText, label, predClass, problist, labelprob, newinterval, showscore;
var maxsents, maxlabels, maxprobs, probcenter, probleft, probright, numcenter, numleft, numright;
var altTexts;


chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    url = tabs[0].url;
	console.log("URL: " + url);

	document.querySelector('div.topbar').innerHTML = `Scanning article...`;

    fetch('https://fotuh2doc8.execute-api.us-west-1.amazonaws.com/gettext?url='+url)
        .then(
            (articleResponse) => {
                // if article extraction is unable to run successfully, show error message
                if (articleResponse.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + articleResponse.status);
                    document.querySelector('div.topbar').innerHTML = "An error has occurred :(";
                    return;
                }
                return articleResponse.json();
            })
        .then(
            (article) => {
                console.log(article);

                // show article headline on popup
                headline = article.title;
                document.querySelector('div.topbar').innerHTML = `${headline}`;

                time = article.time;
                const originalText = article.text;
                articleText = shortenText(originalText, 600);

                // show loading messages for bias score and sentence analysis
                document.getElementById("score").innerHTML = "loading...";
                document.getElementById("analysis-header").innerHTML = "Sentence-Level Analysis is loading...";
                document.getElementById("bias-header").innerHTML = "Most biased sentences are loading...";

                // classify the full text of the article and obtain a bias score
                return fetch('https://u2eedde0w9.execute-api.us-west-2.amazonaws.com/getstuff?text='+articleText);
            })
        .then(
            (classifierResponse) => {
                // if full text classifier is unable to run successfully, show error message
                if (classifierResponse.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + classifierResponse.status);
                    document.getElementById("score").innerHTML = "not available.";
                    document.getElementById("analysis-header").innerHTML = "Sentence-Level Analysis is not available.";
                    document.getElementById("bias-header").innerHTML = "Most biased sentences are not available.";
                    return;
                }
                return classifierResponse.json();
            })
        .then(
            (classifier) => {
                // show bias score on popup
                showBiasScore(classifier);

                // enable alternative article search button
                document.getElementById('search').onclick = showAlternativeArticles;

                document.getElementById('learn-more').onclick = showBiasDetail;

                // classify the sentences in the article and obtain sentence-level scores
                return fetch('https://fotuh2doc8.execute-api.us-west-1.amazonaws.com/getsents?text='+articleText);
            })
        .then(
            (sentencesResponse) => {
                // if sentence-level classifier is unable to run successfully, show error message
                if (sentencesResponse.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + sentencesResponse.status);
                    document.getElementById("analysis-header").innerHTML = "Sentence-Level Analysis is not available.";
                    document.getElementById("bias-header").innerHTML = "Most biased sentences are not available.";
                    return;
                }
                return sentencesResponse.json();
            })
        .then((sentences) => showSentenceAnalysis(sentences))
        .catch((err) => console.log('Fetch Error :-S', err));
    return;
});




function shortenText(str, max = 500) {
    const array = str.trim().split(' ');
    const ellipsis = array.length > max ? '...' : '';

    return array.slice(0, max).join(' ') + ellipsis;
};

function showBiasScore(classifier) {
    // Examine the text in the response
    console.log(classifier);

    label = classifier.class;
    problist = classifier.probabilities;
    labelprob = problist.reduce((a, b) => Math.max(a,b), 0);
    predClass = ""

    if (label===0){
    predClass = "center";
    }
    else if (label===1){
    predClass = "left";
    }
    else if (label===2){
    predClass = "right";
    }
    //console.log(showscore);

    newinterval = getInterval(label, problist);
    showscore = calculateScore(labelprob, problist, newinterval);
    drawcircle(showscore, newinterval);

    document.getElementById("score").innerHTML = showscore.toString();
    document.getElementById("bias-detail").innerHTML = "PBnJ has classified this article as politically ";
    document.getElementById("class").innerHTML = `${predClass}`;

    Array.from(document.getElementsByClassName("bias-color")).forEach(
    function(element, index, array) {
        element.style.color = getColorGradient(showscore, newinterval);
    });

    return classifier;
}

function showSentenceAnalysis(sentences) {
    console.log(sentences);

    maxsents = sentences.maxsents;
    maxlabels = sentences.maxlabels;
    maxprobs = sentences.maxprobs;
    probcenter = sentences.probcenter;
    probleft = sentences.probleft;
    probright = sentences.probright;
    numcenter = sentences.numcenter;
    numleft = sentences.numleft;
    numright = sentences.numright;

    document.getElementById("analysis-header").innerHTML = "Sentence-Level Analysis:";
    document.getElementById("bias-header").innerHTML = "Most Biased Sentences:";

    var sentpropbias1 = document.getElementById("sentbiasprop1");
    sentpropbias1.innerHTML = (Math.floor(probcenter*100)).toString()+"%";
    sentpropbias1.style.color = getColorGradient(100, "center");
    var sentpropbias2 = document.getElementById("sentbiasprop2");
    sentpropbias2.innerHTML = (Math.floor(probleft*100)).toString()+"%";
    sentpropbias2.style.color = getColorGradient(100, "leftcenter");
    var sentpropbias3 = document.getElementById("sentbiasprop3");
    sentpropbias3.innerHTML = (Math.floor(probright*100)).toString()+"%";
    sentpropbias3.style.color = getColorGradient(100, "rightcenter");

    var sentpropbias1 = document.getElementById("sentproplabel1");
    sentpropbias1.innerHTML = "center.";
    sentpropbias1.style.color = getColorGradient(100, "center");
    var sentpropbias2 = document.getElementById("sentproplabel2");
    sentpropbias2.innerHTML = "left.";
    sentpropbias2.style.color = getColorGradient(100, "leftcenter");
    var sentpropbias3 = document.getElementById("sentproplabel3");
    sentpropbias3.innerHTML = "right.";
    sentpropbias3.style.color = getColorGradient(100, "rightcenter");


    document.getElementById("sentbiasis1").innerHTML = " of sentences are ";
    document.getElementById("sentbiasis2").innerHTML = " of sentences are ";
    document.getElementById("sentbiasis3").innerHTML = " of sentences are ";


    var sentscore1 = document.getElementById("sentbiasnum1");
    sentscore1.innerHTML = Math.floor(maxprobs[0]*100).toString()+": ";
    sentscore1.style.color = getColorGradient(Math.floor(maxprobs[0]*100), transformscoretointerval(maxlabels[0]));

    var sentscore2 = document.getElementById("sentbiasnum2");
    sentscore2.innerHTML = Math.floor(maxprobs[1]*100).toString()+": ";
    sentscore2.style.color = getColorGradient(Math.floor(maxprobs[1]*100), transformscoretointerval(maxlabels[1]));

    var sentscore3 = document.getElementById("sentbiasnum3");
    sentscore3.innerHTML = Math.floor(maxprobs[2]*100).toString()+": ";
    sentscore3.style.color = getColorGradient(Math.floor(maxprobs[2]*100), transformscoretointerval(maxlabels[2]));


    document.getElementById("sentbiastext1").innerHTML = maxsents[0];
    document.getElementById("sentbiastext2").innerHTML = maxsents[1];
    document.getElementById("sentbiastext3").innerHTML = maxsents[2];

    return sentences;

}

function showAlternativeArticles() {

	document.getElementById('article-header').innerHTML = `Alternative Articles are loading...`;
	document.getElementById('source-1').innerHTML = `This may take a minute.`;

	/*
	// fetch articles
	fetch('url_for_web/getarticles?url='+getURL()+'?text='+articleText+'?date='+time+'?class='+predClass)
	.then(
	    (searchResponse) => {
			if (searchResponse.status !== 200) {
			    console.log('Looks like there was a problem. Status Code: ' + searchResponse.status);
				document.getElementById("article-header").innerHTML = `Alternative Articles not available.`;
				document.getElementById("article-body").innerHTML = 'You may be seeing this error because...<br><ul><li>No relevant results have been found.</li><li>You have found an edge case we didn't account for.</li></ul>';
				return;
			}
			return searchResponse.json()
		})
	.then(
	    (search) => {

	        console.log(search);
	*/
	        document.getElementById('article-header').innerHTML = `Alternative Articles:`;

            document.getElementById('source-1').innerHTML = `source: `;
            document.getElementById('title-1').innerHTML = `title `;
            document.getElementById('date-1').innerHTML = `(date)`;

            document.getElementById('source-2').innerHTML = `source: `;
            document.getElementById('title-2').innerHTML = `title `;
            document.getElementById('date-2').innerHTML = `(date)`;

            document.getElementById('source-3').innerHTML = `source: `;
            document.getElementById('title-3').innerHTML = `title `;
            document.getElementById('date-3').innerHTML = `(date)`;


            document.getElementById('summary-header').innerHTML = `Summary of Alternative Articles is loading...`;
            document.getElementById('summary-text').innerHTML = `This may take a minute.`;

    /*
            // fetch summary
            return fetch('url_for_web/getsummary?text='+altTexts);
	    })
    .then(
        (summaryResponse) => {
            if (summaryResponse.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + summaryResponse.status);
                document.getElementById("summary-header").innerHTML = `Summary of Alternative Articles is not available.`;
                document.getElementById("summary-text").innerHTML = 'You may be seeing this error because...<br><ul><li>No relevant results have been found.</li><li>You have found an edge case we didn't account for.</li></ul>';
                return;
            }
            return summaryResponse.json();
        })
    .then(
        (summary) => {
    */
            document.getElementById('summary-header').innerHTML = `Summary of Alternative Articles:`;
            document.getElementById('summary-text').innerHTML = `summary`;
    /*
            return summary;
        }
    ).catch((err) => console.log('Fetch Error :-S', err););
	*/
}

function showBiasDetail() {
  //var dots = document.getElementById("dots");
  const moreText = document.getElementById("bias-detail-more");
  const btnText = document.getElementById("learn-more");

  if (moreText.style.display === "none") {
    btnText.innerHTML = "Less";
    moreText.style.display = "inline";
  } else {
    btnText.innerHTML = "Learn more";
    moreText.style.display = "none";
  }
}




function drawcircle(score, interval) {
    canvas = document.getElementById('diagram-canvas');
    context = canvas.getContext('2d');

    context.beginPath();
    context.arc(getX(score, interval), 34, 8, 0, 2* Math.PI, true)
    context.fillStyle = getColorGradient(score, newinterval);
    context.fill();
}

function getX(score, interval){
    if(interval === "leftcenter"){
        x = (1- score/100)*(350-45)+45;
        return x;
    };
    if(interval === "rightcenter"){
        x = (score/100)*(655-350)+350;
        return x;
    };
}

function transformscoretointerval(label){
	if(label === 1){
		return "leftcenter";
	}
	if(label === 2){
		return "rightcenter";
	}
	return "center";
}


function calculateScore(n, problist, interval){
	if (interval === "leftcenter"){
		score = problist[1]/(problist[1]+problist[0]);
		return Math.floor(score*100);
	}
	if (interval === "rightcenter"){
		score = problist[2]/(problist[2]+problist[0]);
		return Math.floor(score*100);
	}
	return Math.floor((1-n)*100)
}

function getInterval(l, p){
	console.log(l)
	console.log(p)
	if(l === 1){
		return "leftcenter";
	}
	if(l === 2){
		return "rightcenter";
	}
	if(p[0]>p[2]){
		return "leftcenter";
	}
	return "rightcenter";
}

// https://stackoverflow.com/questions/3080421/javascript-color-gradient
function getColorGradient(score, interval) {
	if (interval === "leftcenter"){
		end_color = "#1E90FF"; //blue
		start_color = "#808080"; //grey
	}
	if (interval === "rightcenter"){
		end_color = "#FF091A"; //red
		start_color = "#808080"; //grey
	}
	if (interval === "center"){
		end_color = "#808080"; //red
		start_color = "#808080"; //grey
	}
   // strip the leading # if it's there
   start_color = start_color.replace(/^\s*#|\s*$/g, '');
   end_color = end_color.replace(/^\s*#|\s*$/g, '');

   // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
   if(start_color.length == 3){
	 start_color = start_color.replace(/(.)/g, '$1$1');
   }

   if(end_color.length == 3){
	 end_color = end_color.replace(/(.)/g, '$1$1');
   }

   // get colors
   var start_red = parseInt(start_color.substr(0, 2), 16),
	   start_green = parseInt(start_color.substr(2, 2), 16),
	   start_blue = parseInt(start_color.substr(4, 2), 16);

   var end_red = parseInt(end_color.substr(0, 2), 16),
	   end_green = parseInt(end_color.substr(2, 2), 16),
	   end_blue = parseInt(end_color.substr(4, 2), 16);

   // calculate new color
   var diff_red = end_red - start_red;
   var diff_green = end_green - start_green;
   var diff_blue = end_blue - start_blue;

   var percent = score*0.01

   diff_red = ( (diff_red * percent) + start_red ).toString(16).split('.')[0];
   diff_green = ( (diff_green * percent) + start_green ).toString(16).split('.')[0];
   diff_blue = ( (diff_blue * percent) + start_blue ).toString(16).split('.')[0];

   // ensure 2 digits by color
   if( diff_red.length == 1 ) diff_red = '0' + diff_red
   if( diff_green.length == 1 ) diff_green = '0' + diff_green
   if( diff_blue.length == 1 ) diff_blue = '0' + diff_blue

   return '#' + diff_red + diff_green + diff_blue;
 };



