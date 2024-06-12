import { useEffect } from "react";
import io from "socket.io-client";

export default function Chat() {
  useEffect(() => {
    const socket = io("http://localhost:4000");
    socket.on("connect", () => {
      console.log(socket.id);
      socket.emit("chat message", "hello world ");
      socket.on("hi", (data) => {
        alert(data.message);
      });
    });
    socket.on("disconnect", () => {
      console.log(socket.id);
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  return <div>Chat</div>;
}
