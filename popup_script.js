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
    }
});







// color grading: https://stackoverflow.com/questions/11849308/generate-colors-between-red-and-green-for-an-input-range

// function Interpolate(start, end, steps, count) {
//     var s = start,
//         e = end,
//         final = s + (((e - s) / steps) * count);
//     return Math.floor(final);
// }

// function Color(_r, _g, _b) {
//     var r, g, b;
//     var setColors = function(_r, _g, _b) {
//         r = _r;
//         g = _g;
//         b = _b;
//     };

//     setColors(_r, _g, _b);
//     this.getColors = function() {
//         var colors = {
//             r: r,
//             g: g,
//             b: b
//         };
//         return colors;
//     };
// }

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