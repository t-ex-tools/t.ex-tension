import Table from "../data/Table.js";
import Statistics from "../data/Statistics.js";
import Queries from "../data/Queries.js";
import Util from "../data/Util.js";

var StatisticsController = (() => {
  let data = {};

  return {

    compute(params, handler) {
      
      Statistics.query(
        params.boundaries,
        params.type,
        params.queries,
        (result) => {
          if (!params.condition(result)) {
            return;
          }
          
          if (!data[result.query]) {
            data[result.query] = { 
              [result.group]: { 
                [result.feature]: result.data 
              } 
            };
          } else {
            data[result.query][result.group] = { 
              [result.feature]: result.data 
            };
          }

          let query = Queries
            .groups()
            .find((q) => q.id === result.query);

          if (result.group !== query.members.length - 1) {
            return;
          }          

          let headings = Table.headings(query);

          let table = Table.items(
            headings,
            data[result.query],
            result.feature
          );
          
          let meta = { 
            query: query, 
            feature: result.feature 
          }

          handler(
            headings.concat(table),
            meta
          );
        }
      );
    },
    
  };

})();

export default StatisticsController;