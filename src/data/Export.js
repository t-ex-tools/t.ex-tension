import Table from "./Table.js";
import StatisticsController from "../controller/StatisticsController.js";
import DataStream from "./DataStream.js";
import FeatureExtractor from "../features/FeatureExtractor.js";

const memoryLimit = 250 * 1000000;

let transform = (chunk, features) => {
  return chunk.map((d) => {
    let output = features.reduce((acc, f) => {
      let path = f.split(".").slice(1);
      let last = path.pop();

      // https://stackoverflow.com/a/39249367
      // from Laurens' answer on Aug 31, 2016 at 12:14
      let obj = path.reduce((o, key) => (o[key] = o[key] || {}), acc);
      obj[last] = FeatureExtractor.extract(f, d);
      acc.labels = d.labels;

      return acc;
    }, {});
    return output;
  });
};

let shouldDownload = (batch, loaded, total) => 
  memoryLimit <= tex.Util.memorySizeOf(batch) || loaded === total;

export default {

  data(boundaries, type, features, dataTag, handler) {
    let batch = [];
    let n = 0;

    DataStream.labeled(boundaries, type, (chunk, loaded, total) => {
      handler(loaded, total);

      if (chunk === null) {
        return;
      }

      if (features.length > 0) {
        chunk = transform(chunk, features)
      }

      batch = batch.concat(chunk);
      
      if (shouldDownload(batch, loaded, total)) {
        let payload = JSON.stringify(batch.splice(0));
        let path = [dataTag, type];
        let filename = [type, n];
        let ext = "json";
        filename = this.filename(path, filename, ext);

        this.download(filename, payload,"application/json");
        
        n++;
      }
    });
  },

  statistics(boundaries, type, queries, dataTag) {

    let params = {
      condition: (result) => result.loaded === result.total,
      boundaries: boundaries,
      type: type,
      queries: queries
    };

    StatisticsController
      .compute(
        params,
        (table, meta) => {

          Table
            .options()
            .forEach((option) => {
              let path = [dataTag, meta.feature];
              let filename = [meta.feature, option.slug, meta.query.label];
              let ext = "csv";

              filename = this.filename(path, filename, ext);

              this.download(
                filename,
                Table.csv(Table.to(table, option.impl)),
                "data:application/csv;charset=utf-8",
              );
            });
        }
      );
  },

  filename(path, filename, ext) {
    return path.join("/") 
      + "/" 
      + filename.join("-")
      + "." + ext;
  },

  download(filename, payload, type) {
    browser.downloads.download({
      filename: filename,
      url: URL.createObjectURL
      (
        new Blob([ payload ], 
        { type: type })
      ),
    });
  },

};