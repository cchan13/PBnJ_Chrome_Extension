console.log("pop-up script");


const findTab = () =>
new Promise(resolve => {
    chrome.tabs.query(
        {
            active: true,
            currentWindow: true
        },
        tabs => resolve(tabs[0])
    );
});

// async function getTab(){
//     p = await new Promise(resolve => {
//         chrome.tabs.query(
//             {
//                 active: true,
//                 currentWindow: true
//             },
//             tabs => resolve(tabs[0])
//         );
// });
//     return p;
// }


// async function getURL() {
//     let result = await getTab();
//     return result.url;
// }

// https://stackoverflow.com/questions/20028950/chrome-extension-query-tabs-async
var url, tab;
function getURL(){
    chrome.tabs.query({currentWindow: true, active: true},function(tabs){
       url = tabs[0].url;
       tab = tabs[0];
       //Now that we have the data we can proceed and do something with it
    //    processTab();
        // return url;
    });
    return url;
}



console.log("URL: " + getURL())
var headline, time, articletext, label, problist, labelprob, newinterval, showscore;
chrome.runtime.sendMessage({
    message: "get_name"
}, response => {
    if (response.message === 'success'){
        // init();
        document.querySelector('div.topbar').innerHTML = `  URL: ${getURL()}`;
        var currScoretext = document.getElementById("score");
        // newscore = getScore();
        // newinterval = getInterval();
        // currScoretext.innerHTML = newscore.toString();
        // drawcircle(newscore, newinterval);

        fetch('https://1tn5xbbrz0.execute-api.us-west-2.amazonaws.com/getstuff?url='+getURL())
          .then(
            function(response) {
              if (response.status !== 200) {
                document.querySelector('div.topbar').innerHTML = `  No article found.`;
                console.log('Looks like there was a problem. Status Code: ' +
                  response.status);
                return;
              }


              // Examine the text in the response
              response.json().then(function(data) {
                console.log(data);
                    headline = data.title;
                    originaltext = data.text;
                    shortentext = (str = originaltext, max = 500) => {
                          const array = str.trim().split(' ');
                          const ellipsis = array.length > max ? '...' : '';

                          return array.slice(0, max).join(' ') + ellipsis;
                        };
                    articletext = shortentext(originaltext, 500);
                    time = data.time;

                    document.querySelector('div.topbar').innerHTML = `  ${headline}`;


                    fetch('https://u2eedde0w9.execute-api.us-west-2.amazonaws.com/getstuff?text='+articletext)
                      .then(
                        function(response) {
                          if (response.status !== 200) {
                            console.log('Looks like there was a problem. Status Code: ' +
                              response.status);
                            return;
                          }

                          // Examine the text in the response
                          response.json().then(function(classifier) {
                            console.log(classifier);
                            label = classifier.class;
                            predclass = "";
                            problist = classifier.probabilities;
                            labelprob = problist.reduce(function(a, b){
                                return Math.max(a,b);
                            }, 0);

                            if (label===0){
                                predclass = "center";
                            }
                            if (label===1){
                                predclass = "left";
                            }
                            if (label===2){
                                predclass = "right";
                            }
                            console.log(showscore);

                            newinterval = getInterval(label, problist);
                            showscore = calculateScore(labelprob, problist, newinterval);
                            drawcircle(showscore, newinterval);
                            var currScoretext = document.getElementById("score");
                            currScoretext.innerHTML = showscore.toString()+ ` (${predclass})`;
                            var currbodytext = document.getElementById("body1");
                            currbodytext.innerHTML = articletext;

                            Array.from(document.getElementsByClassName("biascolor")).forEach(
                                function(element, index, array) {
                                    // do stuff
                                    element.style.color = colorScore(showscore, newinterval);
                                }
                            );
                    // Array.from(document.getElementsByClassName("biascolor")).forEach(
                    //     function(element, index, array) {
                    //         // do stuff
                    //         element.style.color = colorScore(label, probs);

                          });
                        }
                      )
                      .catch(function(err) {
                        console.log('Fetch Error :-S', err);
                      });

                    // label = data.class;
                    // // probs = Math.max(data.probability);
                    // probs = data.probabilities;
                    // classprob = probs.reduce(function(a, b) {
                    //     return Math.max(a, b);
                    //     }, 0);

                    // newinterval = getInterval(label, probs);
                    // // classprob = getScore();
                    // showscore = calculateScore(classprob, probs, newinterval);

                    // drawcircle(classprob, newinterval);

                    // var currScoretext = document.getElementById("score");
                    // currScoretext.innerHTML = showscore.toString();
                    // Array.from(document.getElementsByClassName("biascolor")).forEach(
                    //     function(element, index, array) {
                    //         // do stuff
                    //         element.style.color = colorScore(label, probs);
                    //     }
                    // );
              });
            }
          )
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });


    //     fetch('https://u2eedde0w9.execute-api.us-west-2.amazonaws.com/getstuff?url='+getURL()).then(r => r.text()).then(result => {
    // // Result now contains the response text, do what you want...
    //     console.log(result);
    //         headline = result.title;
    //         label = result.class;
    //         probs = result.probability;
    //         document.querySelector('div.topbar').innerHTML = `  Headline: ${headline}, Label: ${label}, Probs = ${probs}`;

    //     })

        // currColortext = document.getElementsByClassName('biascolor');
        // for (const text in currColortext) {
        //     text.style.color = changeColor(newscore);
        // }

        // currColortext.innerHTML = 'new text here';

        // $('.biascolor').css('color', changeColor(newscore));
    }
});




function drawcircle(score, interval) {
    // c=document.getElementById("diagramcanvas");
    // ctx=c.getContext("2d");
    // img=document.getElementById("scream");  
    // ctx.drawImage(img,10,10);  
    canvas = document.getElementById('diagramcanvas');
    context = canvas.getContext('2d');
  
    context.beginPath();
    // // leftmost
    // context.arc(45, 34, 8, 0, 2* Math.PI, true)
    // // rightmost
    // context.arc(655, 34, 8, 0, 2* Math.PI, true)
    // // centermost
    // context.arc(350, 34, 8, 0, 2* Math.PI, true)
    context.arc(getX(score, interval), 34, 8, 0, 2* Math.PI, true)

    // context.circle(188, 50, 200, 100);
    context.fillStyle = colorScore(score, newinterval);
    context.fill();
    // context.lineWidth = 7;
    // context.strokeStyle = 'black';
    // context.stroke();
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

      // if(interval === "leftcenter"){
      //   x = (score/100)*(350-45)+45;
      //   return x;
      // };
      // if(interval === "rightcenter"){
      //   x = (score/100)*(655-350)+350;
      //   return x;
      // };
      // if(interval === "centerleft"){
      //   x = (score/100)*(Math.floor(655/4)-45)+45;
      //   return x;
      // };
      // if(interval === "centerright"){
      //   x = (score/100)*(3*Math.floor(655/4)-45)+45;
      //   return x;
      // };

  }



function getScore(){
    return 4;
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
    // if (interval === "centerleft"){
    //     score = problist[0]/(problist[1]+prob[0]);
    //     return Math.floor(score*100);        
    // }
    // if (interval === "centerleft"){
    //     score = problist[0]/(problist[2]+prob[0]);
    //     return Math.floor(score*100);        
    // }
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
        // return "centerleft";
        return "leftcenter";
    }
    return "rightcenter";
}

// color grading: https://stackoverflow.com/questions/11849308/generate-colors-between-red-and-green-for-an-input-range

function Interpolate(start, end, steps, count) {
    var s = start,
        e = end,
        final = s + (((e - s) / steps) * count);
    return Math.floor(final);
}

function Color(_r, _g, _b) {
    var r, g, b;
    var setColors = function(_r, _g, _b) {
        r = _r;
        g = _g;
        b = _b;
    };

    setColors(_r, _g, _b);
    this.getColors = function() {
        var colors = {
            r: r,
            g: g,
            b: b
        };
        return colors;
    };
}


function colorScore(score, interval) {


        var self = this,
            // span = $(self).parent("span"),
            val = score,
            red = new Color(232, 9, 26),
            grey = new Color(128, 128, 128),
            blue = new Color(30,144,255),
            bluegrey = new Color(109, 135, 190),
            redgrey = new Color(190, 94, 78),
            start = blue,
            end = grey;

        if (interval === "leftcenter"){
            end = grey;
            start = blue;
            // end = new Color(30,144,255);
            // start = new Color(109, 135, 190);
        }
        if (interval === "rightcenter"){
            end = red;
            start = grey;
            // start = new Color(190, 94, 78);
            // end = new Color(232, 128, 128);
        }

        // $(".value", span).text(val);

        // if (val > 50) {
        //     start = grey,
        //         end = red;
        //     val = val % 51;
        // }
        var startColors = start.getColors(),
            endColors = end.getColors();
        var r = Interpolate(startColors.r, endColors.r, 50, val);
        var g = Interpolate(startColors.g, endColors.g, 50, val);
        var b = Interpolate(startColors.b, endColors.b, 50, val);

        color = "rgb(" + r + "," + g + "," + b + ")";
        return color;
        // span.css({
        //     color: "rgb(" + r + "," + g + "," + b + ")"
        // });
    }




function changeColor(score) {

        var self = this,
            // span = $(self).parent("span"),
            val = score,
            red = new Color(232, 9, 26),
            grey = new Color(128, 128, 128),
            blue = new Color(30,144,255),
            start = blue,
            end = grey;

        // $(".value", span).text(val);

        if (val > 50) {
            start = grey,
                end = red;
            val = val % 51;
        }
        var startColors = start.getColors(),
            endColors = end.getColors();
        var r = Interpolate(startColors.r, endColors.r, 50, val);
        var g = Interpolate(startColors.g, endColors.g, 50, val);
        var b = Interpolate(startColors.b, endColors.b, 50, val);

        color = "rgb(" + r + "," + g + "," + b + ")";
        return color;
        // span.css({
        //     color: "rgb(" + r + "," + g + "," + b + ")"
        // });
    }


// $(document).on({
//     change: function(e) {

//         var self = this,
//             span = $(self).parent("span"),
//             val = parseInt(self.value),
//             red = new Color(232, 9, 26),
//             white = new Color(255, 255, 255),
//             green = new Color(6, 170, 60),
//             start = blue,
//             end = white;

//         $(".value", span).text(val);

//         if (val > 50) {
//             start = white,
//                 end = red;
//             val = val % 51;
//         }
//         var startColors = start.getColors(),
//             endColors = end.getColors();
//         var r = Interpolate(startColors.r, endColors.r, 50, val);
//         var g = Interpolate(startColors.g, endColors.g, 50, val);
//         var b = Interpolate(startColors.b, endColors.b, 50, val);

//         span.css({
//             backgroundColor: "rgb(" + r + "," + g + "," + b + ")"
//         });
//     }
// }, "input[type='range']");​