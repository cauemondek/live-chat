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
    // onlineClientsID[ws.id].send('test')
    let message = JSON.parse(data)
    if (message.newUserConnect[0] == ws.id) {
      ws.username = message.newUserConnect[1]

      const entryClient = {
        newClientName: ws.username,
      };
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(entryClient));
      });
    } else {
      wss.clients.forEach((client) => {
        client.send(data, { binary: isBinary });
      });
    }
  });
  
  console.log("Conectou Client.ID: " + ws.id);

  onlineClientsID[ws.id] = ws;
  
  const myID = {
    clientID: ws.id,
  };
  ws.send(JSON.stringify(myID));

  ws.on("close", (data) => {
    console.log("Desconectou Client.ID: " + ws.id);

    const desconectClient = {
      desconectClient: ws.id,
    };

    wss.clients.forEach((client) => {
      client.send(JSON.stringify(desconectClient));
    });

    // onlineClients = onlineClients.filter((element) => element !== ws.id);
    delete onlineClientsID[ws.id]
  });
});
