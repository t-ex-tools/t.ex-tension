import Queue from "./Queue.js";
import Http from "./Http.js";

export default (() => {

  let handler = {

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

  browser.runtime
    .onMessage
    .addListener((msg) => {
      let key = Object.keys(msg).pop();
      let result = handler[key].handle(msg[key]);
      return Promise.resolve(result);
    });

})();