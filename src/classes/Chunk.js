import Storage from "../storage/Storage.js";
import Index from "./Index.js";
import LZString from "lz-string";
import browser from "webextension-polyfill";

/**
 * Interface to read and write chunks of data to the storage.
 * WEBSITE_LIST - must be an object containing two properties: "name" and "urls".
 * e.g. { "name": "Website List 1", "urls": [ "http://01.example.com", "http://02.example.com", ... ] }
 */
export default {

  build: (http, js, id) => {
    return {
      [id]: {
        http: {
          data: LZString.compressToUTF16(JSON.stringify(http)),
          size: http.length
        },
        js: {
          data: LZString.compressToUTF16(JSON.stringify(js)),
          size: js.length
        },
        version: browser.runtime.getManifest().version
      }
    };
  },

  /**
   * A (private) function to write indexes to the storage. 
   * Not intended to be used externally.
   * @param {Array<WEBSITE_LIST>} indexes - A value that is written to the storage for the key "indexes".
   * @param {Function} handler - Callback to pass the updated website indexes array to.
   */
  save(chunk, handler) {
    Storage
      .set(chunk)
      .then(() => handler(chunk));
  },

  write(chunk, handler) {
    this.save(chunk, () => {
      Index.add(
        Number(Object.keys(chunk).pop()),
        (indexes) => handler(indexes)
      );
    });
  },

};