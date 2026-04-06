<template>
  <div style="padding: 20px">
    <h1>Nuxt WebSocket Demo</h1>

    <p>Status: {{ status }}</p>

    <input v-model="input" placeholder="Type message" />
    <button @click="sendMessage">Send</button>

    <ul>
      <li v-for="(msg, i) in messages" :key="i">
        {{ msg }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const status = ref("connecting...");
const messages = ref([]);
const input = ref("");
let ws;

onMounted(() => {
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(`${protocol}://${location.host}`);

  ws.onopen = () => {
    status.value = "connected";
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    messages.value.push(data.message);
  };

  ws.onclose = () => {
    status.value = "disconnected";
  };
});

function sendMessage() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(input.value);
  input.value = "";
}
</script>
