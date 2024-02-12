$(document).ready(() => {
  const ws = new WebSocket("ws://localhost:3000");

  function randomColor() {
    const colors = [
      "rgb(243, 120, 120)",
      "rgb(134, 134, 248)",
      "rgb(255, 67, 224)",
      "rgb(39, 219, 39)",
      "rgb(255, 175, 27)",
    ];

    let sortColor = Math.floor(Math.random() * 5);

    return colors[sortColor];
  }

  let user;

  $("#connect").on("click", () => {
    $(".login-container").hide();
    $("#chat-display").css("display", "flex");
    user = {
      name: $("#userName").val(),
      color: randomColor(),
      // id:
    };
  });

  const output = $(".output-message");

  let message = $("#message");

  let storageMessage = {
    user: undefined,
    userColor: undefined,
    message: undefined,
  };
  function sendMessage() {
    let messageValues = {
      user: user.name,
      userColor: user.color,
      message: message.val(),
    };

    storageMessage = messageValues;

    ws.send(JSON.stringify(messageValues));

    createMessage(message.val(), true, undefined, undefined);

    message.val("");
    output.scrollTop(10000000000000);
  }

  $("#submit-message").on("click", sendMessage);
  $(document).on("keypress", (e) => {
    if (e.keyCode == 13 && message.val() != "") {
      sendMessage();
    }
  });

  const processMessage = ({ data }) => {
    const dataMessage = JSON.parse(data);
    if (
      storageMessage.message !== dataMessage.message &&
      storageMessage.user !== dataMessage.user
    ) {
      createMessage(
        dataMessage.message,
        false,
        dataMessage.user,
        dataMessage.userColor
      );
      output.scrollTop(10000000000000);
    }
  };

  ws.onmessage = processMessage;

  function createMessage(content, client, name, color) {
    let inbox = document.createElement("div");
    let msgHeader = document.createElement("div");
    let userName = document.createElement("h4");
    let message = document.createElement("p");

    message.innerHTML = content;

    $(inbox).addClass("inbox");
    $(msgHeader).addClass("msg-header");
    $(message).addClass("message");

    if (client == true) {
      $(inbox).addClass("user-inbox");
      $(msgHeader).addClass("user-msg-header");
      $(msgHeader).addClass("msg-header-ani-user");
      userName.innerHTML = user.name;
      $(userName).css("color", user.color);
    } else {
      $(msgHeader).addClass("msg-header-ani");
      userName.innerHTML = name;
      $(userName).css("color", color);
    }

    output.append(inbox);
    inbox.append(msgHeader);
    msgHeader.append(userName);
    msgHeader.append(message);
  }
});
