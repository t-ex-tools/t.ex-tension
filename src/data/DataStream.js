import Storage from "../storage/Storage.js";
import Index from "../classes/Index.js";
import Setting from "../classes/Setting.js";
import LabelerManager from "./LabelerManager.js";

var DataStream = (() => {
  let indexes = [];
  let settings = {};

  Setting.get(
    [
      "chunksAtOnce", 
      "chunkSize", 
      "jsChunkSize"
    ],
    (cfg) => settings = cfg
  );

  let iterate = (boundaries, handler) => {
    
    Index.all((result) => {
      indexes = Index.range(result, boundaries.lower, boundaries.upper);

      for (let i=0; i * settings.chunksAtOnce < indexes.length; i++) {
        Storage
          .get(
            indexes.slice(
              i * settings.chunksAtOnce,
              (i + 1) * settings.chunksAtOnce
            )
          ).then((chunks) => {
            Object
              .keys(chunks)
              .forEach((key, idx) => {
                let index = i * settings.chunksAtOnce + idx;
              
                handler(
                  { [key]: chunks[key] },
                  index
                )
              });
          });
      }      
    });

  };

  return {

    unlabeled: (boundaries, handler) => {
      let loaded = -1;

      iterate(boundaries, (chunk) => {
        loaded++;
        handler(Object.values(chunk), loaded, indexes.length-1);
      });
    },

    labeled: (boundaries, type, handler) => {
      let port = LabelerManager.channel(type, indexes, handler);
      
      iterate(boundaries, (chunk, index) => {
        LabelerManager.label(chunk, index, type, port);
      });
    },

  };
})();

export default DataStream;