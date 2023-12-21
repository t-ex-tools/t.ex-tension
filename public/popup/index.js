document.getElementById("app-btn").onclick = () => 
  browser.tabs.create({url: browser.runtime.getURL("index.html")});

document.getElementById("flush-btn").onclick = () => 
  browser.runtime.sendMessage({ flush: true });

browser.tabs
  .query({ active: true, currentWindow: true })
  .then((tabs) => {
    browser.tabs
      .sendMessage(tabs[0].id, { popup: { } })
      .then((data) => {

        // TODO: your code here

      });
  });