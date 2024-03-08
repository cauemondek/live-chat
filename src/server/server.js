const { WebSocketServer } = require("ws");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

let onlineClientsUsername = {};
let onlineClientsID = {};

const wss = new WebSocketServer({ port: process.env.PORT || 3000 });

wss.on("connection", (ws, req) => {
  ws.id = crypto.randomUUID();
  onlineClientsID[ws.id] = ws;
  console.log("Conectou Client.ID: " + ws.id);

  ws.on("error", console.error);

  ws.on("message", (data, isBinary) => {
    // onlineClientsUsername[ws.username].send('test') for private message
    let message = JSON.parse(data);

    if (message.newClientConnect) {
      if (message.newClientConnect[0] == ws.id) {
        ws.username = message.newClientConnect[1];
        onlineClientsUsername[ws.username] = ws;

        const entryClient = {
          newClientValor: [ws.id, ws.username],
        };
        wss.clients.forEach((client) => {
          client.send(JSON.stringify(entryClient));
        });
      }
    } else if (message.reqUserList) {
      let resUserList = {
        resUserList: Object.keys(onlineClientsUsername),
      };
      onlineClientsID[message.reqUserList].send(JSON.stringify(resUserList));
    } else {
      wss.clients.forEach((client) => {
        client.send(data, { binary: isBinary });
      });
    }
  });

  const myID = {
    clientID: ws.id,
  };
  ws.send(JSON.stringify(myID));

  ws.on("close", (data) => {
    console.log("Desconectou Client.ID: " + ws.id);

    if (ws.username) {
      const desconectClient = {
        desconectClient: ws.username,
      };

      wss.clients.forEach((client) => {
        client.send(JSON.stringify(desconectClient));
      });

      delete onlineClientsUsername[ws.username];
    }
  });
});
