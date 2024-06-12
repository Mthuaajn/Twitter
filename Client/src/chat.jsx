import { useEffect } from "react";
import io from "socket.io-client";

export default function Chat() {
  useEffect(() => {
    const socket = io("http://localhost:4000");
    socket.on("connect", () => {
      console.log(socket.id);
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
