import Blocklists from "../config/Blocklists.js";
import Preprocessor from "./Preprocessor.js";
import Util from "./Util.js";
import validator from "validator";
import { getDomain } from "tldjs";

var DefaultQueries = (() => {

  let none = {
    id: Util.randomString(),
    label: "None",
    members: [{
      label: "None",
      filter: () => true,
    }]
  };

  let isTP = (r) => {
    let transformed = (r.interface)
      ? Preprocessor.transform.js(r)
      : Preprocessor.transform.http(r);

    let url = getDomain(new URL(transformed.url).hostname);
    let domain = undefined;
    if (transformed.domain) {
      domain = (validator.isURL(transformed.domain)) 
        ? getDomain(new URL(transformed.domain).hostname)
        : transformed.domain;
    }
    
    return url !== domain;
  };

  let isTracker = (r) => r.labels
    .reduce((acc, val) => 
      acc || val.isLabeled, 
      false
    );

  let fptp = {
    id: Util.randomString(),
    label: "FP v. TP",
    members: [{
      label: "First-party",
      filter: (r) => !isTP(r),
    }, {
      label: "Third-party",
      filter: (r) => isTP(r),
    }]
  };

  let tracker = {
    id: Util.randomString(),
    label: "Ad & Tracking",
    members: [{
      label: "Benign",
      filter: (r) => !isTracker(r)
    }, {
      label: "Ad & Tracking",
      filter: (r) => isTracker(r),
    }]    
  }
  
  let defaultGroups = Blocklists
    .filter((l) => l.active)
    .map((l, i) => ({
      id: Util.randomString(),
      label: l.name,
      members: [{
        label: "Labeled by",
        filter: (r) => r.labels[i].isLabeled
      }, {
        label: "Not labeled by",
        filter: (r) => !r.labels[i].isLabeled
      }]
    }));

  return {
    groups: () => {
      return [none, fptp, tracker].concat(defaultGroups);
    }
  }

})();

export default DefaultQueries;