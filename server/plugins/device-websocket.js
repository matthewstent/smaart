import { WebSocket, WebSocketServer } from "ws";

let wsData = []; // latest data from the bridge server
let wsClient;

// Function to connect to the existing bridge server
function connectToBridge() {
  console.log("Connecting to bridge server...");

  wsClient = new WebSocket("ws://144.126.199.128:8080"); // your bridge server IP/domain

  wsClient.on("open", () => {
    console.log("Connected to bridge WebSocket server");
  });

  wsClient.on("message", (msg) => {
    try {
      wsData = JSON.parse(msg.toString());
      broadcastToFrontend(wsData); // send to all frontend clients immediately
    } catch (err) {
      console.error("Invalid JSON from bridge:", err.message);
    }
  });

  wsClient.on("close", () => {
    console.log("Bridge WS closed, reconnecting in 2s...");
    setTimeout(connectToBridge, 2000);
  });

  wsClient.on("error", (err) => {
    console.error("Bridge WS error:", err.message);
  });
}

// rebroadcast function to frontend clients
let wssFrontend;

function broadcastToFrontend(data) {
  if (!wssFrontend) return;

  const payload = JSON.stringify(data);
  wssFrontend.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Connect to bridge server immediately
connectToBridge();

// Nuxt plugin to attach WS server to the main HTTP server
export default defineNitroPlugin((nitroApp) => {
  // Create WS server with `noServer: true` to attach to Nuxt HTTP server
  wssFrontend = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrade requests
  nitroApp.hooks.hook("listen", ({ server }) => {
    server.on("upgrade", (req, socket, head) => {
      if (req.url === "/ws") {
        wssFrontend.handleUpgrade(req, socket, head, (ws) => {
          wssFrontend.emit("connection", ws, req);
        });
      }
    });
  });

  // Handle frontend connections
  wssFrontend.on("connection", (client) => {
    console.log("Frontend WS client connected");

    // Send latest data immediately on connect
    if (wsData.length > 0 && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(wsData));
    }

    client.on("close", () => {
      console.log("Frontend WS client disconnected");
    });

    client.on("error", (err) => {
      console.error("Frontend WS error:", err.message);
    });
  });

  console.log("Frontend WebSocket server attached at /ws");
});
