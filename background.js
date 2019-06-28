let websites = {};

//listen for messages from popup
chrome.runtime.onMessage.addListener(onMessage);

function getDomainFromUrl(url) {
  const matches = url.match(/^(https?:\/\/[^\/]+)/);
  return matches[1];
}

function handleStartTracking(message) {
  if (websites[message.url] === undefined) {
    websites[message.url ] = {
      totalTime: 0
    };
  } else {
    alert("You are already tracking this website");
  }
}

function onMessage(message, sender, sendResponse) {
  switch (message.type) {
    case 'START_TRACKING': {
      handleStartTracking(message);
      break;
    }
  }

};

chrome.tabs.onActivated.addListener(whoIsActive);

//let's track the active id
function whoIsActive(activeInfo) {
  let time = new Date();
  console.log(activeInfo, time);
  if (websites[activeInfo.id] !== undefined) {

  }
}

