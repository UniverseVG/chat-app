import express, { text } from "express";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import Filter from "bad-words";
import { generateLocationMessage, generateMessage } from "./utils/messages.js";
import { addUser, removeUser, getUser, getUsersInRoom } from "./utils/users.js";

dotenv.config({
  path: "./.env",
});
const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));

// let count = 0;

io.on("connection", (socket) => {
  console.log("New websocket connection");
  // socket.emit("message", generateMessage("Welcome!"));
  // socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage(user.username, "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(user.username, `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });
  socket.on("send_message", (data, callback) => {
    // const filter = new Filter({ placeHolder: "X" });
    // const filtered = filter.clean(data);
    // io.emit("receive_message", filtered);
    // callback("Delivered");
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(data)) {
      return callback("Profanity is not allowed");
    }
    io.to(user.room).emit("message", generateMessage(user.username, data));
    callback();
  });
  socket.on("send_location", (data, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "location_message",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${data.latitude},${data.longitude}`
      )
    );
    callback();
  });

  //   socket.emit("message", "Welcome");
  //   socket.emit("countUpdated", count);
  //   socket.on("increment", () => {
  //     count++;
  //     io.emit("countUpdated", count);
  //     // socket.emit("countUpdated", count);
  //   });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(user.username, `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
