import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // Import the uuidv4 function from the uuid package
import socket from "./socket";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";

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

const LIMIT = 10;
const PAGE = 1;
export default function Chat() {
  const [value, setValue] = useState("");
  const [conversations, setConversations] = useState([]);
  const [receiver, setReceiver] = useState([]);
  const [pagination, setPagination] = useState({
    page: PAGE,
    total_page: 0,
  });
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
    socket.on("receive_message", (data) => {
      const { payload } = data;
      setConversations((conversations) => {
        return [...conversations, payload];
      });
    });

    socket.on("connect_error", (err) => {
      console.log(err.data);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (receiver.length !== 0) {
      axios
        .get(`/conversations/${receiver}`, {
          baseURL: import.meta.env.VITE_API_URL,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: { page: PAGE, limit: LIMIT },
        })
        .then((res) => {
          const { conversations, page, total_page } = res.data;
          setConversations(conversations);
          setPagination({
            page,
            total_page,
          });
        });
    }
  }, [receiver]);

  const fetchMoreConversations = () => {
    console.log(pagination);
    if (receiver && pagination.page < pagination.total_page) {
      axios
        .get(`/conversations/${receiver}`, {
          baseURL: import.meta.env.VITE_API_URL,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: {
            page: pagination.page + 1,
            limit: LIMIT,
          },
        })
        .then((res) => {
          const { conversations, page, total_page } = res.data;
          setConversations((prev) => [...prev, ...conversations]);
          setPagination({
            page,
            total_page,
          });
        });
    }
  };

  const send = (e) => {
    e.preventDefault();
    setValue("");
    const conversation = {
      content: value,
      sender_id: profile._id,
      receiver_id: receiver,
    };
    socket.emit("send_message", {
      payload: conversation,
    });
    setConversations((conversations) => [
      {
        ...conversation,
        _id: uuidv4(),
      },
      ...conversations,
    ]);
  };
  return (
    <div>
      <h1>Chat</h1>
      <div>
        {usernames.map((username) => (
          <div key={username.value}>
            <button onClick={() => getProfile(username.value)}>{username.name}</button>
          </div>
        ))}
      </div>
      <div
        id="scrollableDiv"
        style={{
          height: 300,
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}>
        {/*Put the scroll bar always on the bottom*/}
        <InfiniteScroll
          dataLength={conversations.length}
          next={fetchMoreConversations}
          style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
          inverse={true} //
          hasMore={pagination.page < pagination.total_page}
          loader={<h4>Loading...</h4>}
          scrollableTarget="scrollableDiv">
          {conversations.map((conversation) => (
            <div key={conversation._id}>
              <div className="message-container">
                <div
                  className={
                    "message " + (conversation.sender_id === profile._id ? "message-right" : "")
                  }>
                  {conversation.content}
                </div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>
      {/* <div className="chat">
        {conversations.map((conversation) => (
          <div key={conversations._id}>
            <div className="message-container">
              <div
                className={
                  "message " + (conversation.sender_id === profile._id ? "message-right" : "")
                }>
                {conversation.content}
              </div>
            </div>
          </div>
        ))}
      </div> */}
      <form onSubmit={send}>
        <input type="text" onChange={(e) => setValue(e.target.value)} value={value} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
