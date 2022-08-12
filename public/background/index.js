import Queue from "./modules/Queue.js";
import MsgHandler from "./modules/MsgHandler.js";
import websiteList from "../seed/tranco-16-5-22-10k.js";

browser
  .runtime
  .onInstalled
  .addListener((d) => {
    if (d.reason !== "install") {
      return;
    }
    
    tex
      .WebsiteList
      .add(
        websiteList,
        (websiteList) => console.debug("Initial website list added")
      );
  });