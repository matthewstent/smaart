import { WebSocket, WebSocketServer } from "ws";

let wsData = []; // holds latest data from bridge
let wsClient;

// Connect to the bridge server
function connectToBridge() {
  console.log("Connecting to bridge server...");

  wsClient = new WebSocket("ws://144.126.199.128:8080"); // your bridge server IP

  wsClient.on("open", () => {
    console.log("Connected to bridge WebSocket server");
  });

  wsClient.on("message", (msg) => {
    try {
      wsData = JSON.parse(msg.toString());
      // Broadcast immediately to frontend clients
      broadcastToFrontend(wsData);
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

// rebroadcast function
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

// initial bridge connection
connectToBridge();

// Nuxt plugin export
// export default defineNitroPlugin(() => {
//   // Create a WS server for frontend clients
//   wssFrontend = new WebSocketServer({ port: 8090 }); // choose any port

//   wssFrontend.on("connection", (client) => {
//     console.log("Frontend client connected");

//     // Optionally send the latest data immediately on connect
//     if (wsData.length > 0 && client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(wsData));
//     }

//     client.on("close", () => {
//       console.log("Frontend client disconnected");
//     });

//     client.on("error", (err) => {
//       console.error("Frontend WS error:", err.message);
//     });
//   });

//   console.log("Frontend WebSocket server running on port 8090");
// });

export default defineNitroPlugin((nitroApp) => {
  const wss = new WebSocketServer({ noServer: true });

  nitroApp.hooks.hook("listen", ({ server }) => {
    server.on("upgrade", (req, socket, head) => {
      if (req.url === "/ws") {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit("connection", ws, req);
        });
      }
    });
  });

  wss.on("connection", (client) => {
    console.log("Frontend WS connected");
    client.send(JSON.stringify({ message: "Hello from Nuxt backend!" }));
  });
});
