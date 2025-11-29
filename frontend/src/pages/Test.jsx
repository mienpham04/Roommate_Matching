import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export default function Test() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);

    stompClient.debug = null; // prevents console spam + stomp issues

    stompClient.connect({}, () => {
      console.log("Connected to WebSocket!");

      stompClient.subscribe("/topic/match-score", (message) => {
        try {
          const event = JSON.parse(message.body);
          setScores((prev) => [...prev, event]);
        } catch (err) {
          console.error("Failed to parse:", message.body);
        }
      });
    });

    return () => {
      try {
        stompClient.disconnect();
      } catch (e) {
        console.warn("Disconnect failed:", e);
      }
    };
  }, []);

  return (
    <div>
      <h2>Real-Time Match Score Updates</h2>
      {console.log({scores})};
      {scores.map((s, index) => (
        <p key={index}>
          User {s.userId} — score: {s.score}
        </p>
      ))}
    </div>
  );
}
