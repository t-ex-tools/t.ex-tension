import Queue from "./Queue.js";
import Http from "./Http.js";

let subscriber = { };

let criteria = {
  http: { check: (a, b) => a.origin === b.initiator },
  js: { check: (a, b) => a.url === b.source }
};

let filter = (type, sub) => Queue
  .all()
  [type]
  .filter((e) => criteria[type].check(sub, e) && sub.last[type] < e.timeStamp)
  .sort((a, b) => a.timeStamp - b.timeStamp);

let tick = () => {
  Object
    .keys(subscriber)
    .forEach((key) => {
      
      let http = filter("http", subscriber[key]);
      let js = filter("js", subscriber[key]);

      if (http.length === 0 && js.length === 0) {
        return;
      }

      if (http.length > 0) {
        subscriber[key].last.http = http[http.length - 1].timeStamp;
      }

      if (js.length > 0) {
        subscriber[key].last.js = js[js.length - 1].timeStamp;
      }

      browser.tabs.sendMessage(
        subscriber[key].tab.id,
        { http: http, js: js }
      )
    });
};

setInterval(tick, 1000);

export default (() => {

  let handler = {

    "subscribe": {
      handle: (msg, sender, response) => {
        if (0 < sender.frameId) {
          return;
        }

        subscriber[sender.tab.id] = Object.assign({ last: { http: 0, js: 0 } }, sender);
        console.debug("Tab " + sender.tab.id + " subscribed to retrieve real-time data.", subscriber);
      }
    },

    "unsubscribe": {
      handle: (msg, sender, response) => {
        delete subscriber[sender.tab.id];
        console.debug("Tab " + sender.tab.id + " unsubscribed from retrieving real-time data.", subscriber);
      }
    },

    "js": {
      handle: (js) => {
        Queue.push("js", JSON.parse(js));
        return;
      }
    },

    "flush": {
      handle: () => {
        return Queue.flush();
      }
    },

    "settings": {
      handle: (settings) => {
        Queue.settings(settings);
        Http.settings(settings);
        return;
      }
    },

    "recording": {
      handle: (recording) => {
        Queue.recording(recording);
        console.debug("Background: Recording set to " + recording);
        return;
      }
    },

  };

  tex.Runtime
    .onMessage
    .addListener((msg, sender, response) => {
      let key = Object.keys(msg).pop();

      if (!handler[key]) {
        return Promise
          .reject(
            new Error("No handler for message type " + key)
          );
      }

      let result = handler[key].handle(msg[key], sender, response);
      return Promise.resolve(result);
    });

})();