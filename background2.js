var lastZoomLink = null;
var tabPairList = [];

function checkAPI() {
  fetch("http://localhost:5000/zoom")
    .then((response) => response.json())
    .then((data) => {
      var zoomLink = data.zoomLink;
      if (zoomLink && lastZoomLink !== zoomLink) {
        console.log("New meeting link detected!");
        lastZoomLink = zoomLink;

        var url = new URL(zoomLink);
        var domain = url.origin;
        var meetingId = url.pathname.split("/")[2];
        var password = url.searchParams.get("pwd");

        var joinUrl = domain + "/wc/" + meetingId + "/join?pwd=" + password;
        console.log(joinUrl);

        chrome.tabs.create({ url: joinUrl }, function (zoomTab) {
          console.log("create");

          chrome.tabCapture.capture({ audio: true, video: true }, function (stream) {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }

            // Start recording the captured tab content
            var chunks = [];
            var recorder = new MediaRecorder(stream);
            recorder.ondataavailable = function (event) {
              if (event.data.size > 0) {
                chunks.push(event.data);
              }
            };
            recorder.start();

            // Store the tab ID, recorder, and chunks in tabPairList
            tabPairList.push({
              tabId: zoomTab.id,
              recorder: recorder,
              chunks: chunks,
            });
          });
        });
      }
    });
}

// Check API every 5 seconds
setInterval(checkAPI, 5000);

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  // When a tab is closed, stop the recorder and save the recorded media
  tabPairList = tabPairList.filter(function (tabPair) {
    if (tabPair.tabId === tabId) {
      tabPair.recorder.stop();
      tabPair.recorder = null;
      saveRecordedMedia(tabPair.chunks);
      return false;
    } else {
      return true;
    }
  });
});

function saveRecordedMedia(chunks) {
  var blob = new Blob(chunks, { type: "video/webm" });

  // Create a URL object to generate a download link
  var url = URL.createObjectURL(blob);

  // Create a <a> element to trigger the download
  var downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "recorded-meeting.webm";
  downloadLink.click();

  // Clean up the URL object
  URL.revokeObjectURL(url);
}
