const ws = new WebSocket("ws://localhost:8080");

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
  if (
    $("#userName").val() != "" &&
    $("#userName").val().length > 2 &&
    $("#userName").val().length < 13
  ) {
    $(".login-container").hide();
    $("#chat-display").css("display", "flex");
    $("footer").css({
      opacity: 0.1,
      "font-size": "12px",
    });

    user = {
      id: userID,
      name: $("#userName").val(),
      color: randomColor(),
    };
    // Enviando para o servidor novo usuario

    let sendNewUser = {
      newClientConnect: [user.id, user.name],
    };
    let reqUserList = {
      reqUserList: user.id,
    };
    ws.send(JSON.stringify(sendNewUser));
    ws.send(JSON.stringify(reqUserList));

    $("#profileName").text(user.name);
    $("#profileID").text("ID: " + user.id);

    $("#entryNotify").prop("volume", 0.45);
    $("#entryNotify").trigger("play");
    connectionNotify(user.name, true);
  } else {
    $("#inputError").show();
    $("#inputError").fadeTo(400, 1);
  }
});

const output = $(".output-message");
let message = $("#message");

function sendMessage() {
  // Envia uma mensagem com os dados do usuário que enviou junto com o conteúdo
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

  if (dataMessage.newClientValor) {
    // Notifica os usuários sobre a conexão de um client
    switch (dataMessage.newClientValor[0]) {
      case user.id: // Caso seja a conexão do próprio client do usuário não faz nada
        break;
      default: // Caso seja o client de outro usuário notifica a entrada de um novo usuário
        $("#entryNotify").prop("volume", 0.45);
        $("#entryNotify").trigger("play");
        userStatus(dataMessage.newClientValor[1], true);
        connectionNotify(dataMessage.newClientValor[1], true);
        break;
    }
  } else if (dataMessage.desconectClient) {
    // Notifica os usuários sobre a desconexão de um client
    $("#leftNotify").prop("volume", 0.4);
    $("#leftNotify").trigger("play");
    userStatus(dataMessage.desconectClient, false);
    connectionNotify(dataMessage.desconectClient, false);
  } else if (dataMessage.clientID) {
    // Salva o ID do próprio user na página frontend
    userID = dataMessage.clientID;
  } else if (dataMessage.resUserList) {
    // Recebe a resposta da requisição de lista de usuários online
    for (let i = 0; i < dataMessage.resUserList.length; i++) {
      userStatus(dataMessage.resUserList[i], true);
    }
  } else {
    if (user.id != dataMessage.id) {
      // Envia uma mensagem de texto para todos os usuários (exceto quem enviou)
      $("#messageNotify").prop("volume", 0.3);
      $("#messageNotify").trigger("play");
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

function connectionNotify(name, entry) {
  // Cria uma notificação de conexão entrada/saída
  let container = document.createElement("div");
  let connection = document.createElement("div");
  let username = document.createElement("p");
  let comp = document.createElement("p");

  $(container).addClass("new-connection-container");
  $(connection).addClass("connection");
  $(username).addClass("userConnected");

  username.innerHTML = name;
  if (entry == true) {
    comp.innerHTML = "se juntou a conversa";
  } else {
    comp.innerHTML = "saiu da conversa";
  }

  output.append(container);
  container.append(connection);
  connection.append(username);
  connection.append(comp);
}

function createMessage(content, client, name, color) {
  // Cria uma mensagem
  let inbox = document.createElement("div");
  let msgHeader = document.createElement("div");
  let username = document.createElement("h4");
  let message = document.createElement("p");

  message.innerHTML = content;

  $(inbox).addClass("inbox");
  $(msgHeader).addClass("msg-header");
  $(message).addClass("message");

  if (client == true) {
    $(inbox).addClass("user-inbox");
    $(msgHeader).addClass("user-msg-header");
    $(msgHeader).addClass("msg-header-ani-user");
    username.innerHTML = user.name;
    $(username).css("color", user.color);
  } else {
    $(msgHeader).addClass("msg-header-ani");
    username.innerHTML = name;
    $(username).css("color", color);
  }

  output.append(inbox);
  inbox.append(msgHeader);
  msgHeader.append(username);
  msgHeader.append(message);
}

function userStatus(name, status) {
  // Adiciona ou remove usuário da lista online
  if (status == true) {
    let username = document.createElement("p");
    username.innerHTML = name + ",";

    $(username).attr("online", name + "STATUS");
    $(".group-members").append(username);
  } else {
    $("[online=" + name + "STATUS]").remove();
  }
}

$("#openOptions").on("click", () => {
  // Abre o menu de avatar
  $(".avatar-options-container").css("display", "flex");
});

document.querySelectorAll(".avatarButton").forEach((index, count) => {
  // Seleciona o avatar por click
  const picProfile = $("#picProfileDetails");
  $(index).on("click", () => {
    switch (count) {
      case 0:
        $(picProfile).attr("src", "./imgs/avatarA.svg");
        break;
      case 1:
        $(picProfile).attr("src", "./imgs/avatarB.svg");
        break;
      case 2:
        $(picProfile).attr("src", "./imgs/avatarC.svg");
        break;
      case 3:
        $(picProfile).attr("src", "./imgs/avatarD.svg");
        break;
      default:
        break;
    }
    $(".avatar-options-container").hide();
  });
});

let menuOpen = false;
$("#menuSwitch").on("click", function () {
  // Abrir ou fechar a navbar pelo botão responsivo mobile
  if (menuOpen == false) {
    $(this).css({
      "background-color": "#fff",
      color: "#7236fb",
      transform: "rotate(180deg) scale(1.1)",
    });

    $(".navbar").width(305);
    $(".navbar").css("transform", "translateX(0)");

    menuOpen = true;
  } else {
    $(this).css({
      "background-color": "transparent",
      color: "#fff",
      transform: "",
    });

    $(".navbar").width(120);
    $(".navbar").css("transform", "translateX(-135px)");

    menuOpen = false;
  }
});

const year = document.querySelector("#ano");
year.innerHTML = new Date().getFullYear();

window.onresize = console.log(window.innerWidth);
