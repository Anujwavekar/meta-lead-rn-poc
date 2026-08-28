const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to Socket.io:", socket.id);
});

socket.on("existing_leads", (leads) => {
  console.log("Existing leads:", leads);
});

socket.on("new_lead", (lead) => {
  console.log("NEW LEAD RECEIVED:");
  console.log(lead);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});