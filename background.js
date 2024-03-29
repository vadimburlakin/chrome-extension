/* Handling Messages From Popup */
//listen for messages from popup.js
chrome.runtime.onMessage.addListener(onMessage);

//depending on message type decide what action to take
function onMessage(message, sender, sendResponse) {
  switch (message.type) {
  case "START_TRACKING":
  {
    handleStartTracking(message);
    break;
  }
  case "GET_TRACKING_DATA":
  {
    handleShowTrackingData().then(sendResponse);
    return true;
  }
  case "CLEAR_TRACKING_DATA":
  {
    handleClearData();
  }
  }
}
/* END Handling Messages From Popup */

/* Necessary Variables Declaration */
let websites = {};
let currentlyTrackedDomain = {
  domain: null,
  windowId: null
};
let startTracking = null;

/* END Necessary Variables Declaration */

/* Functions for Argus Chrome Extension */
//get the domain from URL
function getDomainFromUrl(url) {
  if (url.includes("chrome://")) {
    return url;
  } else {
    const matches = url.match(/^(https?:\/\/[^/]+)/);
    return matches[1];
  }
}

//promisified function to send data to chrome storage
function sendDataToStorage(data) {
  return new Promise(resolve => {
    chrome.storage.sync.set(data, function() {
      resolve("data was uploaded successfully");
    });
  });
}

//promisified function to get data from chrome storage
function getDataFromStorage() {
  return new Promise(resolve => {
    chrome.storage.sync.get(null, function(result) {
      resolve(result);
    });
  });
}

//execute in case "track" button was clicked
async function handleStartTracking(message) {
  let domain = getDomainFromUrl(message.url);

  /* eslint-disable-next-line require-atomic-updates */
  websites = await getDataFromStorage();
  /* eslint-disable-next-line require-atomic-updates */
  if (websites[domain] === undefined) {
    currentlyTrackedDomain.domain = domain;
    currentlyTrackedDomain.windowId = message.windowId;
    startTracking = new Date();
    /* eslint-disable-next-line require-atomic-updates */
    websites[domain] = 0;
    await sendDataToStorage(websites);
  } else {
    alert("You are already tracking this website");
  }
}

//stop tracking in case we changed active tab and count tracking time
async function handleStopTracking() {
  if (currentlyTrackedDomain.domain !== null) {
  /* eslint-disable-next-line require-atomic-updates */
  websites = await getDataFromStorage();
  /* eslint-disable-next-line require-atomic-updates */
  websites[currentlyTrackedDomain.domain] += Math.floor((new Date() - startTracking) / 1000);
  //don't forget to clear the value
  currentlyTrackedDomain.domain = null;
  await sendDataToStorage(websites);
  }
}

//check in case we changed to the tab that is already tracked
async function handleChangedToTrackedDomain(domain) {
  /* eslint-disable-next-line require-atomic-updates */
  websites = await getDataFromStorage();
  if (websites[domain] !== undefined) {
    currentlyTrackedDomain.domain = domain;
    startTracking = new Date();
  }
}

//Show Tracking Data
async function handleShowTrackingData() {
  return await getDataFromStorage();
}

//Delete all storage data when Clear button is clicked
function handleClearData() {
  chrome.storage.sync.clear();
}
/* END Functions for Argus Chrome Extension */


/* Argus Implementation */
chrome.tabs.onActivated.addListener(activeTabChange);

//take actions in case active tab is changed
function activeTabChange(activeInfo) {
  //check and take actions in case if changed from tracked tab
  //if statement is updated to eliminate race condition problem in case of window and tab change at the same time
  if (currentlyTrackedDomain.domain !== null && currentlyTrackedDomain.windowId === activeInfo.windowId) {
    handleStopTracking();
  }

  chrome.tabs.get(activeInfo.tabId, isCurrentTabTracked);

  //if we open a tab which we already track
  function isCurrentTabTracked(tab) {
    const domain = getDomainFromUrl(tab.url);
    handleChangedToTrackedDomain(domain);
  }
}

//check if the domain within the tracked tab is changed
chrome.tabs.onUpdated.addListener(handleTabsDomainChange);

//react to domain change in the tracked tab
async function handleTabsDomainChange(tabId, changeInfo, tab) {
  let currentTabDomain = getDomainFromUrl(tab.url);
  /* eslint-disable-next-line require-atomic-updates */
  websites = await getDataFromStorage();
  if (currentlyTrackedDomain.domain !== null && websites[currentTabDomain] === undefined) {
    handleStopTracking();
  } else {
    handleChangedToTrackedDomain(currentTabDomain);
  }
}

//listen in case the tab we are tracking is opened in another window
chrome.windows.onFocusChanged.addListener(windowChange);
/* eslint-disable-next-line no-unused-vars */
function windowChange(windowId) {
  if (currentlyTrackedDomain.domain !== null) {
    handleStopTracking();
  }

  //necessary parameter to get access to tabs
  let getInfo = {
    populate: true
  };

  //check the current tab in currently active window
  chrome.windows.getCurrent(getInfo, getCurrentTab);

  function getCurrentTab(window) {
    //check and take actions if we changed to tab we don't track
    let currentTab = window.tabs.find(tab => tab.active === true);
    const domain = getDomainFromUrl(currentTab.url);

    handleChangedToTrackedDomain(domain);
  }
}
/* END Argus Implementation */
