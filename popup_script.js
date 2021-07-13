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

chrome.runtime.sendMessage({
    message: "get_name"
}, response => {
    if (response.message === 'success'){
        // init();
        document.querySelector('div.topbar').innerHTML = `  URL: ${getURL()}`;
        var currScoretext = document.getElementById("score");
        newscore = getScore();
        newinterval = getInterval();
        currScoretext.innerHTML = newscore.toString();
        drawcircle(newscore, newinterval);
        // currColortext = document.getElementsByClassName('biascolor');
        // for (const text in currColortext) {
        //     text.style.color = changeColor(newscore);
        // }
        Array.from(document.getElementsByClassName("biascolor")).forEach(
            function(element, index, array) {
                // do stuff
                element.style.color = changeColor(newscore);
            }
        );
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
    context.fillStyle = changeColor(score);
    context.fill();
    // context.lineWidth = 7;
    // context.strokeStyle = 'black';
    // context.stroke();
  }

  function getX(score, interval){
      if(interval === "leftcenter"){
        x = (score/100)*(350-45)+45;
        return x;
      };
      if(interval === "rightcenter"){
        x = (score/100)*(655-350)+350;
        return x;
      };
      if(interval === "leftright"){
        x = (score/100)*(655-45)+45;
        return x;
      };

  }



function getScore(){
    return 4
}

function getInterval(){
    return "leftright"
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