const { WebSocketServer } = require("ws");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

let clientsOn = [];

let verifyClients = setInterval(() => {
  console.log(clientsOn);
}, 5000);

const wss = new WebSocketServer({ port: process.env.PORT || 3000 });

wss.on("connection", (ws, req) => {
  ws.id = crypto.randomUUID();

  ws.on("error", console.error);

  const ipClient = req.socket.remoteAddress;

  ws.on("message", (data) => {
    wss.clients.forEach((client) => {
      client.send(data.toString());
      console.log(`Received message ${data} from user ${client.id}`);
    });
  });

  console.log("New Client Connected: " + ipClient);
  wss.clients.forEach((client) => {
    console.log("Client.ID: " + client.id);
    clientsOn.push(client.id);
  });

  ws.on("close", (data) => {
    console.log("Client Disconnected: " + ipClient);
    wss.clients.forEach((client) => {
      console.log("Client.ID: " + client.id);
    });
  });
});
