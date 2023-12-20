let mainScript = document.createElement("script");
mainScript.setAttribute("type", "module");
mainScript.setAttribute("src", browser.runtime.getURL("content_scripts/index.js"));

let root = document.documentElement || document.head || document.body;
root.insertBefore(mainScript, root.firstChild);

let events = [];
window.addEventListener("cs", (e) => {
  if (e.detail === null) {
    return;
  } else {
    events.push(e.detail);
  }
});

let emit = () => {
  browser.runtime.sendMessage(
    browser.runtime.id, 
    { js: JSON.stringify([ ...events ]) }
  );
  events = [];
};

setInterval(emit, 1000);

browser.runtime
  .onMessage
  .addListener((msg, sender, response) => {
    if (msg.close) {
      emit();
      return Promise.resolve();
    }
  });


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