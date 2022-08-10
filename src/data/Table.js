import Statistics from "./Statistics";

let get = (data, value) => data[value];

export default {

  options: function () {
    return [{
      label: "Display counts",
      slug: "counts",
      impl: (row, idx, rows) => row
    }, {
      label: "Display % of rows",
      slug: "percentage-of-rows",
      impl: (row, idx, rows) =>
        row
          .map((cell, i) => (i === 0)
            ? cell
            : Statistics.percent(cell, row[row.length - 1])
          )
    }, {
      label: "Display % of columns",
      slug: "percentage-of-columns",
      impl: (row, idx, rows) =>
        row
          .map((cell, i) => (i === 0)
            ? cell
            : Statistics.percent(cell, rows[rows.length - 1][i])
          )
    }, {
      label: "Display % of total",
      slug: "percentage-of-total",
      impl: (row, idx, rows) =>
        row
          .map((cell, i) => (i === 0)
            ? cell
            : Statistics.percent(cell, rows[rows.length - 1][row.length - 1])
          )
    }];
  },

  headings: function (query) {
    return [
      ["Value"]
        .concat(
          query.members.map(
            (e) => e.label
          )
        )
        .concat(["#"])
    ];
  },

  items: function (headings, data, feature) {
    if (Object.keys(data).length === 0) {
      return;
    }

    let rows = Object.values(data)
      .map((e) => Object.keys(e[feature].get()))
      .reduce((acc, val) => [...new Set(acc.concat(val))], [])
      .map((e) => {
        let v = Object.values(data).map((el) =>
          el[feature].exec((data) => get(data, e)) 
            ? el[feature].exec((data) => get(data, e)) 
            : 0
        );
        return [e, ...v];
      });

    rows.forEach((row) => row.push(Statistics.sum(row.slice(1))));

    rows.push(
      headings[0]
        .map((col, idx) =>
          idx === 0 ? "#" : Statistics.sum(rows.map((e) => e[idx]))
        )
    );

    return rows;
  },

  to: function (table, representation) {
    return [ 
      table[0] 
    ].concat(
      table
        .slice(1)
        .map(representation)
    );
  },

  csv: function (table) {
    return table
      .map((row) => {
        return row
          .map((h) => '"' + h.toString().replace(/"/g, '\\"') + '"')
          .join(",");
      }).join("\n");
  },
    
};