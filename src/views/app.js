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
    if ($("#userName").val() != "" && $("#userName").val().length > 3) {
      $(".login-container").hide();
      $("#chat-display").css("display", "flex");

      user = {
        id: userID,
        name: $("#userName").val(),
        color: randomColor(),
      };
      // Enviando para o servidor novo usuario

      let sendNewUser = {
        newUserConnect: [user.id, user.name],
      };
      ws.send(JSON.stringify(sendNewUser));
      
    } else {
      alert("Seu nome deve possuir mais de 3 caracteres");
    }
  });

  const output = $(".output-message");
  let message = $("#message");

  function sendMessage() {
    let messageValues = {
      id: user.id,
      user: user.name,
      userColor: user.color,
      message: message.val(),
    };

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

  let userID;
  const processMessage = ({ data }) => {
    const dataMessage = JSON.parse(data);

    if (dataMessage.newClient) {
      switch (dataMessage.newClient) {
        case user.id:
          break;

        default:
          console.log("New client: " + dataMessage.newClient);
          break;
      }
    } else if (dataMessage.desconectClient) {
      console.log("Client desconectado: " + dataMessage.desconectClient);
    } else if (dataMessage.clientID) {
      userID = dataMessage.clientID;
    } else {
      if (user.id != dataMessage.id) {
        $("#notification").prop("volume", 0.4);
        $("#notification").trigger("play");
        createMessage(
          dataMessage.message,
          false,
          dataMessage.user,
          dataMessage.userColor
        );
        output.scrollTop(10000000000000);
      }
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
