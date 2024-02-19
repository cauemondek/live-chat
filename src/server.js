const { WebSocketServer } = require("ws");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

let onlineClientsID = {};

const wss = new WebSocketServer({ port: process.env.PORT || 3000 });

wss.on("connection", (ws, req) => {
  ws.id = crypto.randomUUID();

  ws.on("error", console.error);

  ws.on("message", (data, isBinary) => {
    // onlineClientsID[ws.username].send('test')
    let message = JSON.parse(data);

    if (message.newClientConnect) {
      if (message.newClientConnect[0] == ws.id) {
        ws.username = message.newClientConnect[1];

        const entryClient = {
          newClientValor: [ws.id, ws.username],
        };
        wss.clients.forEach((client) => {
          client.send(JSON.stringify(entryClient));
        });
      }
    } else {
      wss.clients.forEach((client) => {
        client.send(data, { binary: isBinary });
      });
    }
  });

  console.log("Conectou Client.ID: " + ws.id);

  onlineClientsID[ws.username] = ws;

  const myID = {
    clientID: ws.id,
  };
  ws.send(JSON.stringify(myID));

  ws.on("close", (data) => {
    console.log("Desconectou Client.ID: " + ws.id);

    const desconectClient = {
      desconectClient: ws.username,
    };

    wss.clients.forEach((client) => {
      client.send(JSON.stringify(desconectClient));
    });

    delete onlineClientsID[ws.id];
  });
});
