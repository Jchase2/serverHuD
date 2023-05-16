import io from "socket.io-client";


const socket = io("localhost:3001", {
    auth: {
      token: localStorage.getItem("accessToken")
    },
    transports: ["websocket"],
  });


  export default socket;