import Compressor from "./Compressor.js";
import Preprocessor from "./Preprocessor.js";
import Blocklists from "../config/Blocklists.js";
import { Labeler } from "labeler-core/dist/labeler-core.module.js";

export default (() => {
  let cache = {};
  const interval = 1250;
  
  let blocklists = Blocklists
    .filter((l) => l.active)
    .map((e) => new Labeler.BlockList(e.name, e.url, e.evaluator));

  return {

    exec: (msg, handler) => {
      let data = msg.data.data;
      let type = msg.data.type;

      let set = Compressor
        .decompress(data.chunk[type].data)
        .filter(Preprocessor.filter[type]);

      if (set.length === 0) {
        handler([], data.index, 0, 0);
      }
    
      if (cache[type] && cache[type][data.index]) {
        let cached = Compressor.decompress(cache[type][data.index]);
        let chunk = set
          .map((r, i) => {
            r.labels = cached[i];
            return r; 
          })
        
        handler(
          chunk, 
          data.index, 
          set.length,
          set.length
        );

        return;
      }
      
      set
        .forEach((r, i) => {
          let params = Preprocessor.transform[type](r);
          r.labels = blocklists.map((e) => e.isLabeled(params));
        
          if (i === set.length-1) {
            if (!cache[type]) {
              cache[type] = {};
            }
            cache[type][data.index] = Compressor.compress(
              set.map((e) => e.labels)
            );
          }

          let chunk = (i === set.length-1) 
            ? set 
            : null;

          if (i % interval === 0 ||
              i === set.length-1) {
                handler(
                  chunk, 
                  data.index, 
                  i + 1,
                  set.length
                );
              }
        });

    }
  };
})();