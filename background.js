// Handling Messages From Popup

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
    case 'GET_TRACKING_DATA':
      {
        handleShowTrackingData().then(sendResponse);
        return true;
        break;
      }
  }
}

//Handling Tracking Websites

let websites = {};
let currentlyTrackedDomain = null;
let startTracking = null;

chrome.storage.sync.set({
  websites
}, function() {
  console.log("object sent successfully");
});


//get the domain from URL
function getDomainFromUrl(url) {
  if (url.includes("chrome://")) {
    return url;
  } else {
    const matches = url.match(/^(https?:\/\/[^\/]+)/);
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
function getDataFromStorage(data) {
  return new Promise(resolve => {
    chrome.storage.sync.get(data, function(result) {
      resolve(result);
    });
  });
}

//execute in case "track" button was clicked
async function handleStartTracking(message) {
  let domain = getDomainFromUrl(message.url);

  websites = await getDataFromStorage(websites);
  if (websites[domain] === undefined) {
    currentlyTrackedDomain = domain;
    startTracking = new Date();
    websites[domain] = 0;
    await sendDataToStorage(websites);
  } else {
    alert("You are already tracking this website");
  }
}

//stop tracking in case we changed active tab and count tracking time
async function handleStopTracking() {
  if (currentlyTrackedDomain !== null) {
    websites = await getDataFromStorage(websites);
    websites[currentlyTrackedDomain] += Math.floor((new Date() - startTracking) / 1000);
    //don't forget to clear the value
    currentlyTrackedDomain = null;
    await sendDataToStorage(websites);
  };
}

//check in case we changed to the tab that is already tracked
async function handleChangedToTrackedDomain(domain) {
  websites = await getDataFromStorage(websites);
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
  }

  //check if the domain within the tracked tab is changed
  chrome.tabs.onUpdated.addListener(handleTabsDomainChange);

  //get the current tab id in order to execute the following function
  let tabId = activeInfo.tabId

  //react to domain change in the tracked tab
  async function handleTabsDomainChange(tabId, changeInfo, tab) {
    let currentTabDomain = getDomainFromUrl(tab.url);

    websites = await getDataFromStorage(websites);
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
  }
}

//Showing Tracking Data

async function handleShowTrackingData() {
  return await getDataFromStorage(websites);
}
