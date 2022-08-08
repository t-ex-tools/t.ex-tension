export default (() => {
  let queue = { http: [], js: [] };
  let settings = {};
  let recording = false;

  tex.Setting.get(
    ["chunkSize", "jsChunkSize", "backgroundRecording"],
    (config) => settings = config
  );

  let isRecording = () => 
    recording || 
    settings.backgroundRecording;

  let isFull = () => 
    settings.chunkSize <= queue.http.length || 
    settings.jsChunkSize <= queue.js.length;

  let persist = (http, js, id) => {
    let chunk = tex.Chunk.build(http, js, id);
    tex.Chunk.write(chunk, () => {
      console.debug("Chunk saved.");
    });
  };

  return {

    push: (type, data) => {
      if (!isRecording()) {
        return;
      }

      queue[type] = queue[type].concat(data);

      if (isFull()) {
        let http = queue.http.splice(0, settings.chunkSize);
        let js = queue.js.splice(0, settings.jsChunkSize);

        persist(http, js, Date.now());
      }
    },

    flush: () => {
      let id = Date.now();

      persist(
        queue.http.splice(0), 
        queue.js.splice(0), 
        id
      );

      return id;
    },

    settings: (config) => settings = config,

    recording: (value) => recording = value,

  };

})();