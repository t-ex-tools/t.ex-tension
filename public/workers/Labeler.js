self.importScripts(
  "../js/tex.noBrowser.var.js"
);

let h = function(chunk, index, loaded, total) {
  self.postMessage({
    port: this.msg.data.port, 
    chunk: chunk,
    index: index,
    loaded: loaded,
    total: total
  });
};

let handler = {

  "get": {
    handle: function(msg) {
      this.msg = msg;
      tex.LabelerProcess.exec(msg, h.bind(this));
    }
  },

};

let route = (msg) => {
  if (!msg.data.hasOwnProperty("method")) {
    return;
  }

  let method = msg.data.method;

  if (!handler[method]) {
    return Promise
      .reject(
        new Error("No handler for message type " + key)
      );
  }  

  let result = handler[method].handle(msg);
  return Promise.resolve(result);
};

self.addEventListener("message", route);