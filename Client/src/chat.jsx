import { useEffect, useState } from "react";
import socket from "./socket";
import axios from "axios";

const profile = JSON.parse(localStorage.getItem("profile"));
const usernames = [
  {
    name: "user1",
    value: "user6665816356a86292e6ed4bd4",
  },
  {
    name: "user2",
    value: "user6666618dd170d973c50a7bb7",
  },
];

export default function Chat() {
  const [value, setValue] = useState("");
  const [message, setMessages] = useState([]);
  const [receiver, setReceiver] = useState([]);
  const getProfile = (username) => {
    axios
      .get(`users/${username}`, {
        baseURL: import.meta.env.VITE_API_URL,
      })
      .then((res) => {
        setReceiver(res.data.data._id);
        alert(`Now you can chat with ${res.data.data.name}`);
      });
  };

  useEffect(() => {
    socket.auth = {
      _id: profile._id,
    };
    socket.connect();
    socket.on("disconnect", () => {
      console.log(socket.id);
    });
    socket.on("receive private message", (data) => {
      const content = data.content;
      setMessages((messages) => [
        ...messages,
        {
          content,
          isSender: false,
        },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const send = (e) => {
    e.preventDefault();
    setValue("");
    socket.emit("private message", {
      content: value,
      to: receiver,
      from: profile._id,
    });
    setMessages((messages) => [
      ...messages,
      {
        content: value,
        isSender: true,
      },
    ]);
  };
  return (
    <div>
      <h1>Chat</h1>
      <div>
        {usernames.map((username) => (
          <div key={username.name}>
            <button onClick={() => getProfile(username.value)}>{username.name}</button>
          </div>
        ))}
      </div>
      <div className="chat">
        {message.map((msg, index) => (
          <div key={index}>
            <div className="message-container">
              <div className={"message " + (msg.isSender ? "message-right" : "")}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send}>
        <input type="text" onChange={(e) => setValue(e.target.value)} value={value} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
