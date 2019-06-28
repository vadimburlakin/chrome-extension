let websites = {};
let currentlyTrackedDomain = null;


//listen for messages
chrome.runtime.onMessage.addListener(onMessage);

//the one who desides what to do next depending on message
function onMessage(message, sender, sendResponse) {
  switch (message.type) {
    case 'START_TRACKING': {
      handleStartTracking(message);
      break;
    }
  }

};

//get the domain from URL
function getDomainFromUrl(url) {
  const matches = url.match(/^(https?:\/\/[^\/]+)/);
  return matches[1];
}

//execute in case "track" button was clicked
function handleStartTracking(message) {

  let domain = getDomainFromUrl(message.url);
  currentlyTrackedDomain = domain;

  if (websites[domain] === undefined) {
    currentlyTrackedDomain = domain;
    websites[domain] = new Date();
  } else {
    alert("You are already tracking this website");
  }
}

chrome.tabs.onActivated.addListener(activeTabChange);

//take actions in case acrtive tab is changed
function activeTabChange(activeInfo) {
  if (currentlyTrackedDomain !== null) {
    let currentTime = new Date();
    websites[currentlyTrackedDomain] = Math.floor((currentTime - websites[currentlyTrackedDomain]) / 1000);
    //we moved from the tracking tab, so we need to clear the value
    currentlyTrackedDomain = null;
  };

  chrome.tabs.get(activeInfo.tabId, getCurrentTabUrl);

  //if we open a tab which we already track
  function getCurrentTabUrl(tab) {
    if (websites[tab.url] !== undefined) {
      currentlyTrackedDomain = websites[tab.url];
    };

  };
}
