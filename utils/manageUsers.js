const users = [];

module.exports = {
  createUser: (id, name, room) => users.push({ id, name, rooms: [room] }),
  getAllUsers: () => users,
  getOneUser: (id) => users.find((user) => user.id === id),
  updateUser: (id, name, publicKey) => {
    const idx = users.findIndex((usr) => usr.id == id);
    if (idx === -1) return -1;
    users[idx] = {
      ...users[idx],
      name,
      public: publicKey,
    };
    return users[idx];
  },
  addNewRoomToUser: (id, room) => {
    const user = users.find((usr) => usr.id === id);
    user.rooms.push(room);
    return user;
  },
  removeRoomFromUser: (id, room) => {
    // const user = users.find((usr) => usr.id === id);
    // const roomIdx = users.rooms.findIndex((r) => r === roomId);
    // user.rooms.splice(roomIdx, 1);
    return user;
  },
  removeUser: (id) => {
    const idx = users.findIndex((user) => user.id == id);
    users.splice(idx, 1);
  },
  usersInRoom: (roomId) => {
    const roomUsers = [];
    users.map((user) => {
      user.rooms.forEach((room) => {
        if (room == roomId && !roomUsers.includes(room)) roomUsers.push(user);
      });
    });

    return roomUsers;
  },
};
