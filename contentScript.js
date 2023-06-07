if (window.myScriptHasRun) {
  console.log("The script has already been injected and run.")
} else {
  // Set the flag
  window.myScriptHasRun = true

  if (typeof joinMeetingObserver === "undefined") {
    var joinMeetingObserver = new MutationObserver((mutationsList, observer) => {
      let joinButton = document.querySelector("button.zm-btn.preview-join-button.zm-btn--default.zm-btn__outline--blue")
      if (joinButton) {
        joinButton.click()
        chrome.runtime.sendMessage("startCapture")
        console.log("startCapture send")
        observer.disconnect() // stop observing once the button is clicked
      }
    })

    joinMeetingObserver.observe(document.body, { childList: true, subtree: true })
  }

  if (typeof joinAudioObserver === "undefined") {
    var joinAudioObserver = new MutationObserver((mutationsList, observer) => {
      let joinAudioButton = document.querySelector("button.zm-btn.join-audio-by-voip__join-btn.zm-btn--primary.zm-btn__outline--white.zm-btn--lg")
      if (joinAudioButton) {
        joinAudioButton.click()

        observer.disconnect() // stop observing once the button is clicked
      }
    })

    joinAudioObserver.observe(document.body, { childList: true, subtree: true })
  }

}