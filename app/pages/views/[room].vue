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
                  v-model="max_mins"
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
      <div>
        <div style="height: 400px">
          000
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
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
  TimeScale,
  CategoryScale,
  Legend,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Legend,
  Tooltip,
);

export default {
  name: "SmaartSPLPage",
  data() {
    this.chart = null;
    return {
      logoSrc: "/img/ManCentrallogo.png",
      fps: 1,
      localTime: "",
      timer: null,
      messageArray: [],
      filteredStream: [],
      msg_per_sec: 8,
      max_mins: 30,

      rooms: {
        central1: { slug: "CEN1", index: 0 },
        central2: { slug: "CEN2", index: 1 },
        central3: { slug: "CEN3", index: 2 },
        central4: { slug: "CEN4", index: 3 },
        exchange: { slug: "EXC1", index: 4 },
      },
      currentRoom: "",
      currentMetrics: [],
      showGraph: false,
      intervalId: null,
      recvLive: false,

      metricKeys: [],
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
    this.currentRoom = this.rooms[this.$route.params.room].slug;
    this.currentRoomIndex = this.rooms[this.$route.params.room].index;

    const ws = new WebSocket("wss://smaart.msct.dev/ws/");
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type == "snapshot_end") {
        this.showGraph = true;
        this.recvLive = true;

        if (this.filteredStream.length) {
          this.filteredStream.forEach((el) => {
            // rawArray.push(el);
          });
        }
        if (this.filteredStream.length) {
          this.metricKeys = this.extractMetricKeys(
            this.filteredStream[this.currentRoomIndex],
          );
        }
        this.initChart();

        this.intervalId = setInterval(() => {
          // console.log("winterval");
          // this.initChart();

          this.chart.datasets = this.buildDatasets(this.filteredStream);
          console.log("yodate");
          this.chart.update("none");
        }, 1000 / 8);
      } else if (msg.type === "snapshot_chunk") {
        msg.data.forEach((el, i) => {
          const m = JSON.parse(el);
          this.filteredStream.push(m[this.currentRoomIndex]);
        });
        // } else if (msg.type === "live" && this.recvLive == true) {
        //   const m = JSON.parse(msg.data);
        //   this.filteredStream.push(m[0]);
        //   // console.log(this.filteredStream);
        // }
      } else if (msg.type === "live" && this.recvLive) {
        const entry = JSON.parse(msg.data)[this.currentRoomIndex];
        this.filteredStream.push(entry);

        // Add point to chart and scroll
        if (this.chart) this.addPoint(entry);
      }

      const MAX_MESSAGES = this.msg_per_sec * this.max_mins * 60;
      if (this.filteredStream.length > MAX_MESSAGES) {
        // Keep only the last MAX_MESSAGES
        this.filteredStream = this.filteredStream.slice(
          this.filteredStream.length - MAX_MESSAGES,
        );
      }
    };
    this.filteredStream = [];

    ws.onopen = (event) => {
      ws.send(JSON.stringify({ request: 30 }));
    };

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
  },

  beforeUnmount() {
    clearInterval(this.timer);
    clearInterval(this.graphInterval);
  },

  methods: {
    addPoint(entry) {
      if (!this.chart) return;

      this.chart.data.datasets.forEach((dataset, i) => {
        const key = this.metricKeys[i];
        const metricObj = entry.metrics.find((m) => m[key] !== undefined);
        if (metricObj) {
          dataset.data.push({
            x: new Date(entry.timestamp),
            y: metricObj[key],
          });
        }

        // Keep only last `max_mins` minutes
        const cutoff = Date.now() - this.max_mins * 60 * 1000;
        dataset.data = dataset.data.filter((d) => d.x.getTime() >= cutoff);
      });

      this.chart.update("none"); // no animation
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
    extractMetricKeys(entry) {
      console.log(entry);
      return entry.metrics.map((obj) => Object.keys(obj)[0]);
    },

    buildDatasets(data) {
      const colors = [
        "#FF5733",
        "#33FF57",
        "#3357FF",
        "#F3FF33",
        "#FF33F0",
        "#33FFF3",
        "#FF8F33",
      ];

      // console.log("building data");

      return this.metricKeys.map((key, index) => {
        const color = colors[index % colors.length]; // rotate colors if more keys than colors

        return {
          label: key,
          data: data.map((entry) => {
            const metricObj = entry.metrics.find((m) => m[key] !== undefined);
            return {
              x: new Date(entry.timestamp),
              y: metricObj ? metricObj[key] : null,
            };
          }),
          borderWidth: 1,
          tension: 0.2,
          pointRadius: 0,
          backgroundColor: color,
          borderColor: color, // <-- force visible color
        };
      });
    },

    initChart() {
      const ctx = this.$refs.chartCanvas.getContext("2d");

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          datasets: this.buildDatasets(this.filteredStream),
        },
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,

          scales: {
            x: {
              type: "time",

              time: {
                tooltipFormat: "HH:mm:ss",
              },
            },
            y: {
              beginAtZero: false,
            },
          },
          plugins: {
            legend: {
              display: true,
            },
          },
        },
      });
    },

    updateChart(data) {
      if (!this.chart) return;
      console.log("update...");
      this.chart.data.datasets = this.buildDatasets(data);
      this.chart.update("none"); // no animation for real-time feel
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
