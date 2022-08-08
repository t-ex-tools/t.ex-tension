import Util from "./Util.js";
import Setting from "../classes/Setting.js";

var LabelerManager = (() => {
  let labelers = [ new Worker("../workers/Labeler.js") ];

  let settings = {};
  Setting.get(
    [
      "numberOfWorkers",
      "chunkSize", 
      "jsChunkSize"      
    ],
    (cfg) => {
      settings = cfg;

      for (let i = 1; i < settings.numberOfWorkers; i++) {
        labelers[i] = new Worker("../workers/Labeler.js");
      }
    }
  );

  let start = 0;
  let loaded = 0;
  let total = 0;
  let approx = {
    http: { size: () => settings.chunkSize },
    js: { size: () => settings.jsChunkSize }
  };


  let listen = (port, handler) => {
    labelers
      .forEach((l, i) => {
        l.addEventListener("message", (msg) => {
          if (msg.data.port !== port) {
            return;
          }

          loaded[msg.data.index] = msg.data.loaded;
          total[msg.data.index] = msg.data.total;

          let x = Object.values(loaded).reduce((a, b) => a + b, 0);
          let y = Object.values(total).reduce((a, b) => a + b, 0);
          
          if (x === y) {
            console.debug("Labeling took: " + (Date.now() - start) + " ms");
          }

          handler(msg.data.chunk, x, y);
        })
      });    
  };

  let fill = (value) => (acc, val) => (acc[val] = value, acc);

  return {

    channel: (type, indexes, handler) => {
      start = Date.now();

      let est = (approx[type].size() * indexes.length) / settings.numberOfWorkers;
      loaded = indexes.reduce(fill(0), {});
      total = indexes.reduce(fill(est), {});
      
      let port = Util.randomString();
      listen(port, handler)

      return port;
    },

    label: (chunk, index, type, port) => {
      let l = labelers[index % labelers.length];
      let key = Object.keys(chunk).pop();
      total[key] = chunk[key][type].size;
  
      l.postMessage({
        method: "get",
        port: port,
        data: {
          index: key,
          chunk: chunk[key]
        },
        type: type
      });
    },

  };

})();

export default LabelerManager;