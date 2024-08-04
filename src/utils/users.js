const users = [];

// addUser, removeUser, getUser, getUsersInRoom
const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  // Check for existing user

  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  //Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  return { error: "User not found" };
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  if (user) {
    return user;
  }
  return { error: "User not found" };
};

const getUsersInRoom = (room) => {
  if (!room) {
    return { error: "Room name is required" };
  }
  room = room.trim().toLowerCase();

  const usersInRoom = users.filter((user) => {
    return user.room === room;
  });
  return usersInRoom;
};
// addUser({ id: 22, username: "Andrew", room: "The office fans" });
// addUser({ id: 23, username: "Jen", room: "The office fans" });

// // const res = getUser(22);

// const res = getUsersInRoom("The office fans");
// // const res = removeUser(22);

// console.log({ res });
// console.log({ users });

export { addUser, removeUser, getUser, getUsersInRoom };
