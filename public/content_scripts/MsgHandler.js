let MsgHandler = function () {

  messages = [];

  return {

    "write": (data) => {
      messages.push(data);
    },

    "read": () => {
      return messages;
    }

  }

};