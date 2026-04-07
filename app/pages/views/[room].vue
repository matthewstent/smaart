<template>
  <div
    class="min-h-screen p-[8px] font-sans relative transition-colors duration-500"
    :class="isDark ? 'bg-[#1a1a1e] text-white' : 'bg-[#e3e5ea] text-black'"
  >
    <div class="w-full h-24 flex items-center justify-between">
      <div class="flex items-center">
        <img :src="logoSrc" alt="Manc Central logo" class="" />
        <div class="mcccl font-[Verdana] ml-2">
          Manchester Central - {{ resolveRoom($route.params.room) }}
        </div>
      </div>
      <div class="w-1/4 items-center flex justify-end">
        <span class="mr-2">FPS:</span>
        <select v-model="fps" class="border rounded p-1 dark:text-black">
          <option v-for="n in 8" :key="n">{{ n }}</option>
        </select>

        <input
          type="button"
          class="themeButton"
          title="Light Color Scheme"
          value="&#160;"
          @click="setLightMode"
          style="background-color: white"
        />
        <input
          type="button"
          class="themeButton"
          title="Dark Color Scheme"
          value="&#160;"
          @click="setDarkMode"
          style="background-color: black"
        />
      </div>
    </div>
    <div class="w-full flex justify-between items-center"></div>

    <!-- Time & Menu -->
    <table width="100%" class="mt-2">
      <tr>
        <td class="ping">
          <span class="text-[2em]" type="text" size="5" readonly id="timeInput">
            {{ localTime }}
          </span>
          Local Time
        </td>
        <td class="top">
          <NuxtLink to="/">
            <input
              type="button"
              class="button"
              :class="
                isDark
                  ? 'bg-gradient-to-b from-[#7d818b] to-[#353a48] text-[#dddddd] border-[#9397a7] hover:from-black hover:to-[#7d818b] hover:text-white'
                  : 'bg-gradient-to-b from-[#d5d9e6] to-[#a4a9b9] text-black border-[#9397a7] hover:from-white hover:to-[#d5d9e6] hover:text-black'
              "
              value="Menu"
            />
          </NuxtLink>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <div id="meterArray"></div>
        </td>
      </tr>
    </table>

    <!-- Canvas Options -->
    <table width="100%" class="mt-2">
      <tr>
        <td>
          <table id="canvasOptions" style="width: 100%">
            <tr>
              <td>Input:</td>
              <td style="min-width: 200px">
                <select
                  id="plotInputs"
                  style="min-width: 200px"
                  @change="onPlotInputChange"
                  class="dark:text-black"
                ></select>
                <input type="hidden" id="lastPlotInput" value="-1" />
              </td>
            </tr>
            <tr>
              <td>Display:</td>
              <td style="min-width: 200px">
                <select
                  id="plotDisplayLast"
                  style="min-width: 200px"
                  @change="onPlotTimeWindowChange"
                  autocomplete="off"
                  class="dark:text-black"
                >
                  <option value="30">Last 30 minutes</option>
                  <option value="10" selected>Last 10 minutes</option>
                  <option value="5">Last 5 minutes</option>
                </select>
              </td>
            </tr>
          </table>
        </td>
        <td>
          <table id="canvasOptions" style="width: 100%">
            <tr>
              <td style="min-width: 40px">
                <div style="background: #009b05; margin: 0">&nbsp;</div>
              </td>
              <td style="min-width: 200px">
                <select
                  id="plotMetric0"
                  style="min-width: 200px"
                  @change="onPlotMetricChange"
                  class="dark:text-black"
                ></select>
              </td>
            </tr>
            <tr>
              <td style="min-width: 40px">
                <div style="background: #3264f5; margin: 0">&nbsp;</div>
              </td>
              <td style="min-width: 200px">
                <select
                  id="plotMetric1"
                  style="min-width: 200px"
                  @change="onPlotMetricChange"
                ></select>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Canvas Display -->
    <div style="float: left; position: relative; width: 100%" class="mt-2">
      <!-- <canvas id="history"></canvas> -->
      <canvas id="metricsChart" width="800" height="400"></canvas>
      <div
        class="w-full h-[40vh] bg-[url('/img/bg.png')] object-cover bg-no-repeat bg-black"
      ></div>

      <!-- <td>
            <input
              type="button"
              class="button"
              id="refreshPlot"
              value="refresh"
              @click="refreshPlot"
            />
          </td> -->
    </div>

    <footer class="mt-[42vh] text-center text-xs">
      &copy; Copyright 2026, Rational Acoustics LLC, All Rights Reserved -
      System Designed and Installed by Sterling Event Group Ltd
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useDarkMode } from "~/composables/useDarkMode";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
} from "chart.js";
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
);

export default {
  name: "SmaartSPLPage",
  data() {
    return {
      logoSrc: "/img/ManCentrallogo.png",
      fps: 1,
      localTime: "",
      timer: null,
      messageArray: [],
      msg_per_sec: 8,
      max_mins: 30,
      graphInterval: null,
      rooms: {
        central1: "CEN1",
        central2: "CEN2",
        central3: "CEN3",
        central4: "CEN4",
        exchange: "EXC1",
      },
      currentRoom: "",
      currentMetrics: [],
      graphObject: { labels: [], values: [] },
      chartInstance: null,
      recvLive: false,
    };
  },
  setup() {
    const { isDark, toggle } = useDarkMode();

    const setLightMode = () => {
      if (isDark.value) toggle();
    };
    const setDarkMode = () => {
      if (!isDark.value) toggle();
    };

    return { isDark, setLightMode, setDarkMode };
  },
  mounted() {
    // Frontend example (Options API or Vue 3)
    this.currentRoom = this.rooms[this.$route.params.room];

    const ws = new WebSocket("wss://smaart.msct.dev/ws/");

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      //   console.log("Live data from backend:", data.type);
      console.log(msg.type);
      if (msg.type == "snapshot_end") {
        console.log(this.messageArray);
        this.initGraph();
        setTimeout(() => {
          this.recvLive = true;
        }, 5000);
      } else if (msg.type === "snapshot_chunk") {
        // Add chunk to data
        console.log(msg.data);
        msg.data.forEach((el, i) => {
          this.messageArray.push(JSON.parse(el));
          //   this.updateGraphing(JSON.parse(el));
        });
        // this.messageArray.push(...JSON.parse(msg.data));
        // console.log(this.messageArray[0]);
        // console.log("ok");
      }
      if (msg.type === "live" && this.recvLive == true) {
        // Add new live message
        // this.messageArray.push(JSON.parse(msg.data));
        // console.log(JSON.parse(msg.data));
        this.updateGraphing(JSON.parse(msg.data));
      }
      const MAX_MESSAGES = this.msg_per_sec * this.max_mins * 60;
      if (this.messageArray.length > MAX_MESSAGES) {
        // Keep only the last MAX_MESSAGES
        this.messageArray = this.messageArray.slice(
          this.messageArray.length - MAX_MESSAGES,
        );
      }
    };

    setTimeout(() => {
      this.messageArray = [];
      ws.send(JSON.stringify({ request: 30 }));
    }, 1500);

    this.localTime = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    this.timer = setInterval(() => {
      this.localTime = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }, 1000);

    if (typeof onBodyLoad === "function") onBodyLoad();
    window.addEventListener("resize", () => {
      if (typeof onBodyResize === "function") onBodyResize();
    });

    setInterval(() => {
      //   console.log(this.messageArray.length);
      //   console.log(this.messageArray[0]);
    }, 1000);
  },

  beforeUnmount() {
    clearInterval(this.timer);
    clearInterval(this.graphInterval);
  },

  methods: {
    setupGraphing: function () {
      const { labels, values } = this.graphObject; // your object

      // Prepare datasets
      const datasets = labels.map((metricName, metricIndex) => {
        return {
          label: metricName,
          data: values.map((point) => point.data[metricIndex]), // pick value for this metric
          borderColor: `hsl(${(metricIndex * 60) % 360}, 70%, 50%)`,
          backgroundColor: `hsla(${(metricIndex * 60) % 360}, 70%, 50%, 0.2)`,
          tension: 0,
          borderWidth: 0.5,
          pointRadius: 0,
        };
      });

      // X-axis labels = timestamps
      const xLabels = values.map((point) =>
        new Date(point.timestamp).toLocaleTimeString(),
      );

      const ctx = document.getElementById("metricsChart").getContext("2d");

      this.chartInstance = new Chart(ctx, {
        type: "line",

        data: {
          labels: xLabels, // timestamps
          datasets: datasets,
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: "Room Metrics Over Time" },
            legend: { display: true },
          },
          scales: {
            y: { beginAtZero: false },
            x: { title: { display: true, text: "Time" } },
          },
        },
      });

      console.log("i", this.chartInstance.data);
    },
    initGraph: function () {
      this.messageArray.forEach((el, i) => {
        el.forEach((lel, li) => {
          if (lel.channelName == this.currentRoom) {
            const metricsArray = lel.metrics;
            const labels = metricsArray.map((m) => Object.keys(m)[0]);
            const values = {
              timestamp: lel.timestamp,
              data: metricsArray.map((m) => Object.values(m)[0]),
            };

            if (!this.graphObject.labels.length) {
              this.graphObject.labels = labels; // set only once
            }
            this.graphObject.values.push(values);
          }
        });
      });

      this.graphObject.values.sort((a, b) => a.timestamp - b.timestamp);
      console.log(this.graphObject.values);
      this.setupGraphing();
    },
    updateGraphing: function (d) {
      d.forEach((el, i) => {
        if (el.channelName == this.currentRoom) {
          const metricsArray = el.metrics;
          const labels = metricsArray.map((m) => Object.keys(m)[0]);
          const values = {
            timestamp: el.timestamp,
            data: metricsArray.map((m) => Object.values(m)[0]),
          };
          if (!this.graphObject.labels.length) {
            this.graphObject.labels = labels; // set only once
          }
          this.graphObject.values.push(values);
          const point = values; // the new one
          const timestamp = new Date(point.timestamp).toLocaleTimeString();
          this.chartInstance.data.labels.push(timestamp);
          //   this.chartInstance.data.datasets.forEach((ds, i) => {
          //     ds.data.push(point.data[i]);
          //   });

          this.chartInstance.data.datasets.forEach((ds, i) => {
            if (values[i] !== undefined) {
              ds.data.push(values[i]);
            } else {
              console.warn(
                `Skipping dataset ${ds.label} — no value for this metric`,
              );
            }
          });
        }
      });

      console.log("g", this.chartInstance.data);

      //   this.graphObject.values.forEach((point) => {
      //     const timestamp = new Date(point.timestamp).toLocaleTimeString();
      //     this.chartInstance.data.labels.push(timestamp);

      //     this.chartInstance.data.datasets.forEach((ds, i) => {
      //       ds.data.push(point.data[i]);
      //     });
      //   });

      // Trim old points if exceeding 30 min
      //   const MAX_POINTS = 8 * 60 * 30; // 8 messages/sec × 30 min
      //   if (this.chartInstance.data.labels.length > MAX_POINTS) {
      //     this.chartInstance.data.labels.splice(
      //       0,
      //       this.chartInstance.data.labels.length - MAX_POINTS,
      //     );
      //     this.chartInstance.data.datasets.forEach((ds) => {
      //       ds.data.splice(0, ds.data.length - MAX_POINTS);
      //     });
      //   }

      this.chartInstance.update("none"); // fast update without animation
    },

    resolveRoom: function (r) {
      if (r == "central1") {
        return "Central 1";
      } else if (r == "central2") {
        return "Central 2";
      } else if (r == "central3") {
        return "Central 3";
      } else if (r == "central4") {
        return "Central 4";
      } else if (r == "exchange") {
        return "Exchange Hall";
      } else {
        return "Invalid Room";
      }
    },
    onPlotInputChange() {
      console.log("Plot input changed");
    },
    onPlotTimeWindowChange() {
      console.log("Plot time window changed");
    },
    onPlotMetricChange() {
      console.log("Plot metric changed");
    },
    refreshPlot() {
      console.log("Refreshing plot...");
    },
  },
};
</script>

<style scoped>
body {
  font-family: Verdana, Tahoma, sans-serif;
}

.mccc {
  width: 100px;
  text-align: center;
  vertical-align: middle;
}

.mcccl {
  text-align: left;
  font-size: 2.5em;
  vertical-align: middle;
  padding: 2px;
  font-family: Verdana, Tahoma, sans-serif;
}

.top {
  text-align: right;
  vertical-align: top;
  padding: 10px;
}

.ping {
  text-align: left;
  min-width: 100px;
}

.inner {
  border-radius: 4px;
  border: 2px solid #31363c;
  background-color: #35414d;
}

.button {
  font-size: 1.2em;
  width: 200px;
  height: 40px;
  border-radius: 4px;
  padding: 0px 4px;
  background-color: #c2c7db;
  /* color: #dddddd; */
  border: 1px solid #9397a7;
}

.button:hover {
  background-color: #eeeeee;
  color: #ffffff;
}

.themeButton {
  cursor: pointer;
  width: 50px;
  height: 27px;
  border-radius: 5px;
  border: #dddddd 1px solid;
  margin: 0 5px;
}

#timeInput {
  font-size: 2em;
  font-weight: bolder;
  text-align: center;
  border: none;
}

select,
input[type="text"] {
  border-radius: 4px;
  padding: 4px;
}
</style>
