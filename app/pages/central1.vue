<template>
  <div
    class="min-h-screen p-[8px] font-sans relative transition-colors duration-500"
    :class="isDark ? 'bg-[#1a1a1e] text-white' : 'bg-[#e3e5ea] text-black'"
  >
    <!-- Header Table -->
    <table width="100%">
      <tr>
        <td class="mccc">
          <img :src="logoSrc" alt="Manc Central logo" height="94" width="94" />
        </td>
        <td class="mcccl font-[Verdana]">Manchester Central</td>
        <td class="top">
          FPS:
          <select v-model="fps" class="border rounded p-1 dark:text-black">
            <option v-for="n in 8" :key="n">{{ n }}</option>
          </select>
          &nbsp;
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
        </td>
      </tr>
    </table>

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

export default {
  name: "SmaartSPLPage",
  data() {
    return {
      logoSrc: "/img/ManCentrallogo.png",
      fps: 1,
      localTime: "",
      timer: null,
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
    const ws = new WebSocket("ws://smaart-test.msct.dev/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Live data from backend:", data);
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
  },

  methods: {
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
