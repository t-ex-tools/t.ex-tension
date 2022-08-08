import LZString from "lz-string"

export default {

  compress(data) {
    return LZString.compressToUTF16(JSON.stringify(data));
  },

  decompress(data) {
    return JSON.parse(LZString.decompressFromUTF16(data));
  }

};