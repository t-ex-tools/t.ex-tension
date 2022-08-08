import { Labeler } from "labeler-core/dist/labeler-core.module.js";

export default [{
  name: "EasyList",
  version: "latest",
  url: "https://easylist.to/easylist/easylist.txt",
  active: true,
  evaluator: Labeler.AdBlockEvaluator(Labeler.AdBlockParser),
}, {
  name: "EasyPrivacy",
  version: "latest",
  url: "https://easylist.to/easylist/easyprivacy.txt",
  active: true,
  evaluator: Labeler.AdBlockEvaluator(Labeler.AdBlockParser),
}, {
  name: "Disconnect.me",
  version: "latest",
  url: "https://raw.githubusercontent.com/disconnectme/disconnect-tracking-protection/master/services.json",
  active: false,
  evaluator: Labeler.DisconnectMeEvaluator(Labeler.DisconnectMeParser),
}];