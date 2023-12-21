/**
 * Task 1: Inject script to intercept JavaScript API access events.
 *         Script must be injecte in the context of the DOM as scope 
 *         of this script is isolated, i.e., overriding interfaces here
 *         has no effect.
 * ---
 * Inject 'content_scripts/index.js' in DOM to override JavaScript API interfaces
 * specified in 'content_scripts/Interfaces.js'. For this, 'Injector' module
 * in 'content_scripts/Injector.js' is used. 
 */
let mainScript = document.createElement("script");
mainScript.setAttribute("type", "module");
mainScript.setAttribute("src", browser.runtime.getURL("content_scripts/index.js"));

let root = document.documentElement || document.head || document.body;
root.insertBefore(mainScript, root.firstChild);

/**
 * Task 2: Pass intercepted events to background script.
 * ---
 * Intercepted JavaScript API access events are emitted by 'content_scripts/index.js'
 * as event 'cs' (short for 'content script'). These events are accumulated in 
 * array 'events' and periodically (every second) sent to the background script for persistence.
 */
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


/**
 * Task 3: Subscribe to real-time HTTP/S communication and JavaScript API access events
 *         of the visited website, i.e., the website this content script is injected in.
 * ---
 * Send message to background to subscribe to real-time data.
 * When leaving or refreshing the page, send message to unsubscribe.
 * Module 'background/MsgHandler' periodically sends (every second)
 * relevant data, i.e., HTTP/S communication and JavaScript API access events triggered
 * by the website this script is injected, to this tab.
 * Module 'content_scripts/MsgHandler' allows to write messages to a private queue.
 * When a message is retrieved from the background script, data is stored in that queue.
 * Whenn a message is retrieved from the popup, messages in that queue are passed to the popup.
 */

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

let msgHandler = new MsgHandler();

browser.runtime
  .onMessage
  .addListener((msg, sender, response) => {

    if (msg.hasOwnProperty("background")) {
      msgHandler.write(msg.background);

    } else if (msg.hasOwnProperty("popup")) {
      return Promise.resolve(msgHandler.read());
      
    } else {
      return Promise.reject(new Error("No handler for message " + JSON.stringify(msg)));

    }

  });