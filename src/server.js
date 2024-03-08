const { WebSocketServer } = require("ws");
const crypto = require("crypto");
const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");

const app = express();
app.use(express.json());

const server = http.createServer(app);

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(__dirname + "/views"));

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();

let onlineClientsUsername = {};
let onlineClientsID = {};

const wss = new WebSocketServer({ server });

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

app.get("/", async (req, res) => {
  res.render("index.html");
});

server.listen(port, () => {
  console.log("Server running on port: " + port);
})
