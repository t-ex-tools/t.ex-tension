import Storage from "../storage/Storage.js";

/**
 * The key at which the websites indexes array is stored in the key-value store.
 */
const key = "indexes";

/**
 * Interface to create / read / update / and delete website indexes.
 * WEBSITE_LIST - must be an object containing two properties: "name" and "urls".
 * e.g. { "name": "Website List 1", "urls": [ "http://01.example.com", "http://02.example.com", ... ] }
 */
export default {
  
  /**
   * A function to retrieve all website indexes from the storage
   * or an empty array in case no indexes have been stored so far.
   * @param {Function} handler - Callback to pass the retrieved indexes to.
   */
  all(handler) {
    Storage
      .get(key)
      .then((res) => {
        let indexes = (res.indexes) ? res.indexes : [];
        handler(indexes);
      });
  },

  /**
   * A (private) function to write indexes to the storage. 
   * Not intended to be used externally.
   * @param {Array<WEBSITE_LIST>} indexes - A value that is written to the storage for the key "indexes".
   * @param {Function} handler - Callback to pass the updated website indexes array to.
   */
  save(indexes, handler) {
    Storage
      .set({ [key]: indexes })
      .then(() => handler(indexes));
  },

  /**
   * A function to retrieve the i-th website list.
   * @param {Number} index - Index of the desired website list.
   * @param {Function} handler - Callback to pass the desired website list to.
   */
  get(index, handler) {
    this.all((indexes) => {
      handler(indexes[index]);
    });
  },

  /**
   * A function to override the i-th website list with a new value.
   * @param {Number} index  - Index of the website to be overriden.
   * @param {WEBSITE_LIST} list - The new value of the i-th website list.
   * @param {Function} handler - Callback to pass the updated website indexes array to.
   */
  set(index, list, handler) {
    this.all((indexes) => {
      indexes[index] = list;
      this.save(indexes, handler);
    });

  },

  /**
   * A function to append a website list to the existing website indexes array.
   * @param {WEBSITE_LIST} list - The website list to be added.
   * @param {Function} handler - Callback to pass the updated website indexes array to.
   */
  add(list, handler) {
    this.all((indexes) => {
      indexes.push(list);
      this.save(indexes, handler);
    });
  },

  /**
   * A function to remove the i-th website list from the existing website indexes array.
   * @param {Number} index - The index of the website list to be removed.
   * @param {Function} handler - Callback to pass the updated website indexes array to.
   */
  remove(index, handler) {
    this.all((indexes) => {
      indexes.splice(index, 1);
      this.save(indexes, handler);
    });
  },

};