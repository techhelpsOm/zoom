// Replace lastZoomLink and tabPairList with a Map
var zoomTabs = new Map();

function checkAPI() {
  fetch("http://localhost:5000/zoom")
    .then((response) => response.json())
    .then((data) => {
      console.log(data.zoomLink, data)
      var zoomLink = data.zoomLink
      if (zoomLink && !zoomTabs.has(zoomLink)) {
        console.log("New meeting link detected!")

        var url = new URL(zoomLink)
        var domain = url.origin
        var meetingId = url.pathname.split("/")[2]
        var password = url.searchParams.get("pwd")

        var joinUrl = domain + "/wc/" + meetingId + "/join?pwd=" + password

        chrome.tabs.create({ url: joinUrl }, function (zoomTab) {
          if (zoomTab) {
            console.log("Zoom tab opened:", zoomTab);
        
            // Execute the content script in the Zoom tab
            chrome.tabs.executeScript(zoomTab.id, { file: "contentScript.js" }, function () {
              // Add the tab ID to the map of zoom links
              zoomTabs.set(zoomLink, zoomTab.id);
            })
          } else {
            console.error('Failed to create Zoom tab.');
          }
        })
      }
    })
}

// Check API every 5 seconds
setInterval(checkAPI, 5000)

// Store the media recorder instances per tab
var mediaRecorders = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === "startCapture") {
    let tabId = sender.tab.id;
    
    // Constraints for tab capture
    const constraints = {
      audio: true,
      video: false,
    };

    chrome.tabCapture.capture(constraints, function(stream) {
      let options = {mimeType: 'audio/webm'};
      let mediaRecorder = new MediaRecorder(stream, options);
      let audioChunks = [];

      mediaRecorder.ondataavailable = function(event) {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = function() {
        // You can do whatever you want with the audioChunks here
        // You could create a Blob and a URL, for instance:
        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        // Or you could send it to your server, etc.
      };

      // Start recording
      mediaRecorder.start();
      
      // Store the media recorder instance
      mediaRecorders.set(tabId, mediaRecorder);
    });
  }
});

function stopRecording(tabId) {
  // Fetch the media recorder instance
  let mediaRecorder = mediaRecorders.get(tabId);
  
  // Stop the media recorder
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}
