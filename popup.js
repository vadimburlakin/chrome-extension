window.addEventListener('load', function load(event) {
  //create event listener for Track button
  var createButton = document.getElementById('create_button');

  createButton.addEventListener('click', function() {
    let params = {
      active: true
    };

    //trigger the following function each time button is clicked

    chrome.tabs.query(params, getCurrent);

    //send current tab url to background script
    function getCurrent(tabs) {
      console.log(tabs);
      let message = {
        type: 'START_TRACKING',
        url: tabs[2].url
      }
      chrome.runtime.sendMessage(message);
    };
  });
});
