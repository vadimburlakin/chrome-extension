const COLORS = [
  "#4dc9f6",
  "#f67019",
  "#f53794",
  "#537bc4",
  "#acc236",
  "#166a8f",
  "#00a950",
  "#58595b",
  "#8549ba"
];

let data = {
  labels: [],
  datasets: [{
    backgroundColor: [],
    data: []
  }]
};

var ctx = document.getElementById("myChart");
var chart = null;

window.addEventListener("load", function load() {
  //event listener for Track button
  var trackButton = document.getElementById("track_button");

  //trigger the following function each time button is clicked
  trackButton.addEventListener("click", function() {
    let getInfo = {
      populate: true
    };

    chrome.windows.getCurrent(getInfo, getCurrentTab);

    function getCurrentTab(window) {
      //check and take actions if we changed to tab we don't track
      let currentTab = window.tabs.find(tab => tab.active === true);
      let message = {
        type: "START_TRACKING",
        url: currentTab.url,
        windowId: currentTab.windowId
      };
      chrome.runtime.sendMessage(message);
    }
  });

  let message = {
    type: "GET_TRACKING_DATA"
  };

  chrome.runtime.sendMessage(message, responseCallback);

  function responseCallback(response) {
    response = Object.entries(response);
    response.forEach((webData, i) => {
      data.labels.push(webData[0]);
      data.datasets[0].backgroundColor.push(COLORS[i]);
      data.datasets[0].data.push(webData[1]);
    });
    chart = new Chart(ctx, {
      type: "pie",
      data: data
    });
  }

  //event listener for Clear button
  var clearButton = document.getElementById("clear_data");

  //trigger the following function each time button is clicked
  clearButton.addEventListener("click", function() {
    let message = {
      type: "CLEAR_TRACKING_DATA"
    };
    chrome.runtime.sendMessage(message);
    chart.destroy();
  });

});
