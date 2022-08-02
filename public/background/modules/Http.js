import Queue from "./Queue.js";

const urlFilter = { urls: ["http://*/*", "https://*/*"] };
const firefox = browser.runtime.hasOwnProperty("getBrowserInfo");

export default (() => {
  let http = {};
  let settings = {};

  tex.default.Setting.get(
    ["httpBody"],
    (config) => settings = config
  );

  let push = (requestId, success) => {
    Queue.push("http",
      [
        Object.assign(
          { ...http[requestId] },
          { success: success }
        )
      ]
    );
    delete http[requestId];
  };

  browser.webRequest
    .onBeforeRequest
    .addListener((d) => {
      if (!settings.httpBody) {
        delete d.requestBody;
      }

      http[d.requestId] = d
    },
      urlFilter,
      ["requestBody"]
    );

  browser.webRequest
    .onBeforeSendHeaders
    .addListener((d) => {
      http[d.requestId].requestHeaders = d.requestHeaders;
    },
      urlFilter,
      (firefox)
        ? ["requestHeaders"]
        : ["requestHeaders"].concat(["extraHeaders"])
    );

  browser.webRequest
    .onResponseStarted
    .addListener((d) => {
      http[d.requestId].response = d
    },
      urlFilter,
      (firefox)
        ? ["responseHeaders"]
        : ["responseHeaders"].concat(["extraHeaders"])
    );

  browser.webRequest
    .onCompleted
    .addListener((d) => {
      push(d.requestId, true);
    },
      urlFilter
    );

  browser.webRequest
    .onErrorOccurred
    .addListener((d) => {
      push(d.requestId, false);
    },
      urlFilter
    );

  return {

    settings: (config) => settings = config,

  }
})();