let websites = {};
let currentlyTrackedDomain = null;
let startTracking = null;


//listen for messages
chrome.runtime.onMessage.addListener(onMessage);

//the one who desides what to do next depending on message
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

chrome.tabs.onActivated.addListener(activeTabChange);

//take actions in case active tab is changed
function activeTabChange(activeInfo) {
  if (currentlyTrackedDomain !== null) {
    let currentTime = new Date();
    websites[currentlyTrackedDomain] += Math.floor((currentTime - startTracking) / 1000);
  }

  //don't forget to clear the value
  currentlyTrackedDomain = null;

  chrome.tabs.get(activeInfo.tabId, getCurrentTabUrl);

  //if we open a tab which we already track
  function getCurrentTabUrl(tab) {
    const domain = getDomainFromUrl(tab.url);
    if (websites[domain] !== undefined) {
      currentlyTrackedDomain = domain;
      startTracking = new Date();
    };

    console.log(websites);
  };
}

chrome.windows.onFocusChanged.addListener(windowChange);

function windowChange(windowId) {

  let getInfo = {
    populate: true
  }

  chrome.windows.getCurrent(getInfo, getCurrentTab);

  function getCurrentTab(window) {

    if (currentlyTrackedDomain !== null) {
      let currentTime = new Date();
      websites[currentlyTrackedDomain] += Math.floor((currentTime - startTracking) / 1000);
    } else if (window.tabs.length > 0) {
      console.log(window.tabs);
      let currentTab = window.tabs.filter(tab => tab.active === true);
      const domain = getDomainFromUrl(currentTab[0].url);
          if (websites[domain] !== undefined) {
            currentlyTrackedDomain = domain;
            startTracking = new Date();
          }

      console.log(window.tabs);
      console.log(websites);
    }
  }
}
