import { WebSocket, WebSocketServer } from "ws";

let wsData = [];
let wsClient;

// Connect to your existing bridge
function connectToBridge() {
  wsClient = new WebSocket("ws://144.126.199.128:8080"); // bridge server

  wsClient.on("open", () => console.log("Connected to bridge WS"));
  wsClient.on("message", (msg) => {
    try {
      wsData = JSON.parse(msg.toString());
      broadcastToFrontend(wsData);
    } catch (e) {
      console.error("Invalid JSON from bridge:", e.message);
    }
  });

  wsClient.on("close", () => setTimeout(connectToBridge, 2000));
  wsClient.on("error", (err) => console.error("Bridge WS error:", err.message));
}

connectToBridge();

let wssFrontend;

// Broadcast function
function broadcastToFrontend(data) {
  if (!wssFrontend) return;
  const payload = JSON.stringify(data);
  wssFrontend.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(payload);
  });
}

export default defineNitroPlugin((nitroApp) => {
  wssFrontend = new WebSocketServer({ noServer: true });

  nitroApp.hooks.hook("listen", ({ server }) => {
    server.on("upgrade", (req, socket, head) => {
      if (req.url === "/ws") {
        wssFrontend.handleUpgrade(req, socket, head, (ws) => {
          wssFrontend.emit("connection", ws, req);
        });
      }
    });
  });

  wssFrontend.on("connection", (client) => {
    console.log("Frontend WS connected");
    if (wsData.length > 0) client.send(JSON.stringify(wsData));

    client.on("close", () => console.log("Frontend WS disconnected"));
    client.on("error", (err) =>
      console.error("Frontend WS error:", err.message),
    );
  });
});
