const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

const players = {};

io.on("connection", (socket) => {
  console.log("Un joueur est connecté : " + socket.id);

  players[socket.id] = {
    x: 0,
    y: 0,
    frameY: 0,
    flip: false,
    moving: false,
    running: false,
  };

  socket.emit("currentPlayers", players);

  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    player: players[socket.id],
  });

  socket.on("playerMovement", (movementData) => {
    if (players[socket.id]) {
      players[socket.id] = movementData;

      socket.broadcast.emit("playerMoved", {
        id: socket.id,
        ...movementData,
      });
    }
  });

  // Déconnexion
  socket.on("disconnect", () => {
    console.log("Joueur déconnecté : " + socket.id);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
