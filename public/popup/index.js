document.getElementById("app-btn").onclick = () => 
  browser.tabs.create({url: browser.runtime.getURL("index.html")});

document.getElementById("flush-btn").onclick = () => 
  browser.runtime.sendMessage({ flush: true });

browser.runtime
  .sendMessage(
    browser.runtime.id,
    { subscribe: { } }
  );

window.addEventListener("beforeunload", () => {
  browser.runtime
    .sendMessage(
      browser.runtime.id,
      { unsubscribe: { } }
    );
});

browser.runtime
  .onMessage
  .addListener((msg, sender, response) => {
    console.log(msg);
  });