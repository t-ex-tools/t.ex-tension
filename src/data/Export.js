import Table from "./Table.js";
import StatisticsController from "../controller/StatisticsController.js";

export default {

  statistics(boundaries, type, queries, dataTag) {

    Table
      .options()
      .forEach((option) => {
        let params = {
          condition: (result) => result.loaded === result.total,
          boundaries: boundaries,
          type: type,
          queries: queries,
          option: option.impl
        };

        StatisticsController
          .compute(
            params,
            (table, meta) => {
              let path = [dataTag, meta.feature];
              let filename = [meta.feature, option.slug, meta.query.label];
              let ext = "csv";

              filename = this.filename(path, filename, ext);

              this.download(
                filename,
                Table.csv(table),
                "data:application/csv;charset=utf-8",
              )
            }
          );
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