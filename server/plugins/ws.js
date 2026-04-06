import { WebSocketServer } from "ws";

export default defineNitroPlugin((nitroApp) => {
  const server = nitroApp.h3App.server;

  if (!server) return;

  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.send(JSON.stringify({ message: "Hello from server 👋" }));

    ws.on("message", (message) => {
      console.log("Received:", message.toString());

      // Echo message back
      ws.send(
        JSON.stringify({
          message: `Server received: ${message}`,
        }),
      );
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
});
