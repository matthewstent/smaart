// // /server/plugins/bridge-rebroadcast.js
// import { WebSocketServer } from "ws";

// let wsData = [];
// let wsClient;

// // Connect to your bridge
// function connectToBridge() {
//   wsClient = new WebSocket("ws://144.126.199.128:8080");
//   wsClient.on("message", (msg) => {
//     try {
//       wsData = JSON.parse(msg.toString());
//       broadcastToFrontend(wsData);
//     } catch (e) {
//       console.error(e);
//     }
//   });
//   wsClient.on("close", () => setTimeout(connectToBridge, 2000));
//   wsClient.on("error", console.error);
// }
// connectToBridge();

// let wssFrontend;
// function broadcastToFrontend(data) {
//   if (!wssFrontend) return;
//   const payload = JSON.stringify(data);
//   wssFrontend.clients.forEach((c) => {
//     if (c.readyState === WebSocket.OPEN) c.send(payload);
//   });
// }

// export default defineNitroPlugin((nitroApp) => {
//   wssFrontend = new WebSocketServer({ noServer: true });

//   nitroApp.hooks.hook("listen", ({ server }) => {
//     server.on("upgrade", (req, socket, head) => {
//       if (req.url === "/ws") {
//         wssFrontend.handleUpgrade(req, socket, head, (ws) => {
//           wssFrontend.emit("connection", ws, req);
//         });
//       }
//     });
//   });

//   wssFrontend.on("connection", (client) => {
//     if (wsData.length) client.send(JSON.stringify(wsData));
//   });
// });
