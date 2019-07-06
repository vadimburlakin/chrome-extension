window.addEventListener('load', function load(event) {
  //create event listener for Track button
  var createButton = document.getElementById('create_button');

  //trigger the following function each time button is clicked
  createButton.addEventListener('click', function() {
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
});
