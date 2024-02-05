const ws = new WebSocket("ws://localhost:3000");

const processMessage = ({ data }) => {
  console.log("Mensagem recebida: " + data);
};

ws.onmessage = processMessage;


const mensagem = document.getElementById("message");
document.getElementById("submitMessage").addEventListener("click", () => {
  ws.send(mensagem.value);
  console.log("Mensagem enviada: " + mensagem.value);
});
