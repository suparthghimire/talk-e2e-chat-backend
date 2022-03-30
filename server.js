const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const app = express();

const http = require("http").Server(app);
const cors = require("cors");
const {
  getAllUsers,
  createUser,
  removeUser,
  updateUser,
  addNewRoomToUser,
  usersInRoom,
  getOneUser,
  removeRoomFromUser,
} = require("./utils/manageUsers");
const { filterArrRemId } = require("./utils/helpers");
const {
  createNewInvitation,
  invitationExist,
  removeInvitation,
} = require("./utils/manageInvitations");

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: "*",
  },
});

dotenv.config();
app.use(cors());

io.on("connection", (socket) => {
  const id = socket.id;
  /**
   * Generate P and Q such that
   * P is large prime number
   * Q < P and Q is primitive root of P
   * Send P and Q to all connected clients
   */
  const p = 19;
  const g = 10;

  socket.on("user_join", ({ name }) => {
    const room = "room-" + id + Date.now().toString();
    createUser(id, name, room);
    socket.join(room);
    socket.emit("constants", { p, g, id, name, rooms: [room] });
  });
  socket.on("update_user", ({ id, name, publicKey }) => {
    const user = updateUser(id, name, publicKey);
    if (user !== -1) {
      socket.emit("user_updated", user);
      socket.broadcast.emit("new_user", user);
    } else {
      socket.emit("user_update_failed");
    }
  });

  socket.on("invite_user", ({ otherRoom, myRoom }) => {
    const combinedRoom = [otherRoom, myRoom].sort().join("");
    if (!invitationExist(combinedRoom)) {
      socket.join(combinedRoom);
      const user = addNewRoomToUser(id, combinedRoom);
      socket.emit("update_user", user);
      const roomUsers = usersInRoom(combinedRoom);
      const otherUser = roomUsers.filter((u) => u.id === id);

      createNewInvitation(combinedRoom);
      socket.emit("invitation_created");
      socket.broadcast.to(otherRoom).emit("new_invitation", {
        roomId: combinedRoom,
        otherUser: otherUser[0],
      });
    } else socket.emit("invitation_exists");
  });
  socket.on("other_user_in_room", ({ combinedRoomId, myId }) => {
    const allUsersInRoom = usersInRoom(combinedRoomId);
    const otherUser = allUsersInRoom.filter((users) => users.id !== myId);
    socket.emit("other_user_in_room", otherUser[0]);
  });
  socket.on("invitation_accepted", (combinedRoom) => {
    socket.join(combinedRoom);
    const user = addNewRoomToUser(id, combinedRoom);
    socket.emit("update_user", user);
    io.to(combinedRoom).emit("invitation_accepted", combinedRoom);
  });
  socket.on("invitation_rejected", (combinedRoom, myId, otherUserRoom) => {
    const rejectingUser = getOneUser(myId);
    removeInvitation(combinedRoom);
    const user = removeRoomFromUser(myId, combinedRoom);
    socket.emit("invitation_removed", combinedRoom);
    socket.emit("update_user", user);

    socket.broadcast
      .to(otherUserRoom)
      .emit("invitation_rejected", rejectingUser);
  });
  socket.on("chat_join", ({ combinedRoomId, myId }) => {
    const allUsersInRoom = usersInRoom(combinedRoomId);
    const otherUser = allUsersInRoom.filter((users) => users.id !== myId);
    socket.broadcast.to(otherUser[0].rooms[0]).emit("chat_join");
  });
  socket.on("public_key", (otherPublicKey) => {
    const users = getAllUsers();
    const otherUsers =
      users.length > 0 && users.filter((users) => users.id !== id);
    socket.broadcast.emit("public_key", otherPublicKey);

    socket.emit(
      "otherUsersPublicKey",
      otherUsers.length > 0 ? otherUsers[0].publicKey : ""
    );
  });

  socket.on("message_send", ({ combinedRoom, message, senderId }) => {
    console.log("The Message is ", message);
    io.to(combinedRoom).emit("message_recieve", { senderId, message });
  });
  socket.on("get_all_users", () => {
    const users = getAllUsers();
    const filteredUsers = filterArrRemId(users, id);
    socket.emit("all_users", filteredUsers);
  });
  socket.on("disconnect", () => {
    removeUser(id);
    console.log("Disconnection", socket.id);
    const users = getAllUsers();
    const filteredUsers = filterArrRemId(users, id);
    io.emit("all_users", filteredUsers);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  return res.json({ data: "123" });
});

const PORT = process.env.port || 3000;
http.listen(PORT, () => console.log(`Server Started at ${PORT}`));
