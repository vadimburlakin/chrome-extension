window.addEventListener('load', function load(event) {
      //event listener for Track button
      var trackButton = document.getElementById('track_button');

      //trigger the following function each time button is clicked
      trackButton.addEventListener('click', function() {
        let queryInfo = {};
        chrome.tabs.query(queryInfo, getCurrentTab);

        //send current tab url to background script
        function getCurrentTab(tab) {
          let currentTab = tab.find(tab => tab.active === true && !tab.url.includes("google.com"));
          let message = {
            type: 'START_TRACKING',
            url: currentTab.url
          }
          chrome.runtime.sendMessage(message);
        };
      });

      //event listener for Show Data button
      var showDataButton = document.getElementById("show_data");

      //trigger the following function each time button is clicked
      showDataButton.addEventListener('click', function() {
          let message = {
            type: 'GET_TRACKING_DATA'
          };

          chrome.runtime.sendMessage(message, responseCallback);

          function responseCallback(response) {
            console.log("I fired");
            console.log(response);
          }
        });
      });
