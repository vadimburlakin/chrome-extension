let websites = {};
let currentlyTrackedDomain = null;
let startTracking = null;

//listen for messages from popup
chrome.runtime.onMessage.addListener(onMessage);

//depending on message type decide what action to take
function onMessage(message, sender, sendResponse) {
  switch (message.type) {
    case 'START_TRACKING':
      {
        handleStartTracking(message);
        break;
      }
  }

};

//get the domain from URL
function getDomainFromUrl(url) {
  if (url.includes("chrome://")) {
    return url;
  } else {
    const matches = url.match(/^(https?:\/\/[^\/]+)/);
    return matches[1];
  }
}

//execute in case "track" button was clicked
function handleStartTracking(message) {
  console.log(message);
  let domain = getDomainFromUrl(message.url);
  currentlyTrackedDomain = domain;

  if (websites[domain] === undefined) {
    currentlyTrackedDomain = domain;
    websites[domain] = 0;
    startTracking = new Date();

  } else {
    alert("You are already tracking this website");
  }
}

//stop tracking in case we changed active tab and count tracking time
function handleStopTracking() {
  if (currentlyTrackedDomain !== null) {
    let currentTime = new Date();
    websites[currentlyTrackedDomain] += Math.floor((currentTime - startTracking) / 1000);
  };

  //don't forget to clear the value
  currentlyTrackedDomain = null;
}

//check in case we changed to the tab that is already tracked
function handleChangedToTrackedDomain(domain) {
  if (websites[domain] !== undefined) {
    currentlyTrackedDomain = domain;
    startTracking = new Date();
  };
}

chrome.tabs.onActivated.addListener(activeTabChange);

//take actions in case active tab is changed
function activeTabChange(activeInfo) {
  //check and take actions in case if changed from tracked tab
  handleStopTracking();


  chrome.tabs.get(activeInfo.tabId, isCurrentTabTracked);

  //if we open a tab which we already track
  function isCurrentTabTracked(tab) {
    const domain = getDomainFromUrl(tab.url);
    handleChangedToTrackedDomain(domain);

    console.log(websites);
  };

  //check if the domain within the tracked tab is changed
  chrome.tabs.onUpdated.addListener(handleTabsDomainChange);

  //get the current tab id in order to execute the following function
  let tabId = activeInfo.tabId

  function handleTabsDomainChange(tabId, changeInfo, tab) {
    let currentTabDomain = getDomainFromUrl(tab.url);
    if (websites[currentTabDomain] === undefined) {
      handleStopTracking();
    } else {
      handleChangedToTrackedDomain(currentTabDomain);
    }
  };
}

//listen in case the tab we are tracking is opened in another window
chrome.windows.onFocusChanged.addListener(windowChange);

function windowChange(windowId) {
  handleStopTracking();

  //necessary parameter to get access to tabs
  let getInfo = {
    populate: true
  }

  //check the current tab in currently active window
  chrome.windows.getCurrent(getInfo, getCurrentTab);

  function getCurrentTab(window) {
    //check and take actions if we changed to tab we don't track
    let currentTab = window.tabs.find(tab => tab.active === true);
    const domain = getDomainFromUrl(currentTab.url);

    handleChangedToTrackedDomain(domain);
    console.log(websites);
  };
}
