import FeatureExtractor from "../features/FeatureExtractor.js";
import DataStream from "./DataStream.js";
import Temp from "./Temp.js";

var Statistics = (() => {
  let stats = {};

  let put = (data, value) => (data[value])
    ? data[value]++
    : data[value] = 1

  return {

    count: (chunk, handler, info) => {
      if (chunk.length === 0) {
        handler(info)
      }

      chunk.forEach((d, i, array) => {
        let x = FeatureExtractor.extract(info.feature, d);

        if (typeof x === "object" && x.length > 0) {
          x.forEach((e, j, arr) => {
            let kv = FeatureExtractor.encode(e);
            stats[info.query][info.group][info.feature]
              .exec((data) => put(data, kv));

            if (i === array.length - 1 &&
                j === arr.length - 1) {
                  handler(info);
              }
          });
        } else {
          stats[info.query][info.group][info.feature]
            .exec((data) => put(data, x));

          if (i === array.length - 1) {
            handler(info);
          }
        }
      });
    },
    // NOTE: all features must be of same type
    query: function (boundaries, type, queries, handler) {
      [...new Set(Object
        .values(queries)
        .flat()
      )].forEach((query) => {
        if (!stats[query.id]) {
          stats[query.id] = {};
          query.members
            .forEach((group, index) => {
              stats[query.id][index] = {};
            });
        }
      });

      let toCompute = { ...queries };
      Object
        .keys(queries)
        .forEach((feature) => {
          toCompute[feature] = queries[feature]
            .filter((query) => {
              if (stats[query.id][0][feature]) {
                Object.keys(stats[query.id])
                  .forEach((g, i) => {
                    handler({
                      feature: feature,
                      query: query.id,
                      group: i,
                      data: stats[query.id][i][feature],
                      loaded: 1,
                      total: 1
                    })
                  });
                return false;
              }
              return true;
            });

          if (toCompute[feature].length === 0) {
            delete toCompute[feature];
          }
        });

      if (Object.keys(toCompute).length === 0) {
        return;
      }

      DataStream.labeled(boundaries, type, (chunk, index, total) => {
        window.dispatchEvent(new CustomEvent("statistics:loading:update", {
          detail: {
            loaded: index,
            total: total
          }
        }));

        if (!chunk) {
          return;
        }

        Object
          .keys(toCompute)
          .forEach((feature) => {
            toCompute[feature]
              .forEach((query) => {
                query.members.forEach((g, i) => {

                  if (!stats[query.id][i][feature]) {
                    stats[query.id][i][feature] = new Temp({});
                  }

                  let c = chunk.filter(g.filter);
                  let info = {
                    feature: feature,
                    query: query.id,
                    group: i,
                    data: stats[query.id][i][feature],
                    loaded: index,
                    total: total,
                  };
                  
                  this.count(c, handler, info);
                });
              })
          })
      });
      
    },

    sum: function (data) {
      return data.reduce((acc, val) => acc += val, 0);
    },

    percent: function (dividend, divisor) {
      return ((dividend / divisor) * 100).toFixed(2)
    },

  };
})();

export default Statistics;