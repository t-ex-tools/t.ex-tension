import {  
  AdBlockParser,
  AdBlockEvaluator,
  DisconnectMeParser,
  DisconnectMeEvaluator
} from "labeler-core";

export default [{
  name: "EasyList",
  version: "latest",
  url: "https://easylist.to/easylist/easylist.txt",
  active: true,
  evaluator: AdBlockEvaluator(AdBlockParser),
}, {
  name: "EasyPrivacy",
  version: "latest",
  url: "https://easylist.to/easylist/easyprivacy.txt",
  active: true,
  evaluator: AdBlockEvaluator(AdBlockParser),
}, {
  name: "Disconnect.me",
  version: "latest",
  url: "https://raw.githubusercontent.com/disconnectme/disconnect-tracking-protection/master/services.json",
  active: false,
  evaluator: DisconnectMeEvaluator(DisconnectMeParser),
}];