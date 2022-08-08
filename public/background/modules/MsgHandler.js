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

  tex.Runtime
    .onMessage
    .addListener((msg) => {
      let key = Object.keys(msg).pop();

      if (!handler[key]) {
        return Promise
          .reject(
            new Error("No handler for message type " + key)
          );
      }

      let result = handler[key].handle(msg[key]);
      return Promise.resolve(result);
    });

})();