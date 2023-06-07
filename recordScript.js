// Define the observer function
function observeButtonRemoval(button) {
  return new Promise((resolve) => {
    var observer = new MutationObserver(function (mutationsList, observer) {
      for (let mutation of mutationsList) {
        if (mutation.type === "childList" && !button.isConnected) {
          console.log(button, "has been removed!")
          observer.disconnect()
          resolve()
        }
      }
    })

    observer.observe(button.parentElement, { childList: true })
  })
}

// Find the "Only Screen" button and set up an observer
var onlyScreenButton = document.querySelector('button.css-1h511dw[title="Only Screen"]')
if (onlyScreenButton) {
  onlyScreenButton.click()
  observeButtonRemoval(onlyScreenButton).then(() => {
    // Find the "System" button and set up an observer
    var systemButton = document.querySelector('button.css-hygyd4[title="System"]')
    if (systemButton) {
      systemButton.click()
      observeButtonRemoval(systemButton).then(() => {
        // Find the "Start Recording" button and set up an observer
        var startRecordingButton = document.querySelector("button.css-131yo1y")
        if (startRecordingButton) {
          startRecordingButton.click()
          observeButtonRemoval(startRecordingButton)
        }
      })
    }
  })
}
