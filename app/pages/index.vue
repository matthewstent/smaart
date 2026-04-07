<template>
  <div
    class="min-h-screen p-[8px] flex flex-col items-center justify-start font-sans relative transition-colors duration-500"
    :class="isDark ? 'bg-[#1a1a1e] text-white' : 'bg-[#e3e5ea] text-black'"
  >
    <!-- Dark Mode Toggle -->
    <div class="absolute top-4 right-4">
      <button
        @click="toggleDarkMode"
        class="px-4 py-2 rounded shadow text-sm transition-colors duration-500"
        :class="isDark ? 'bg-[#31363c] text-white' : 'bg-[#bac3ce] text-black'"
      >
        {{ isDark ? "Light Mode" : "Dark Mode" }}
      </button>
    </div>

    <!-- Header Table -->
    <table class="mt-8 text-left">
      <tr>
        <td class="mccc">
          <img :src="logoSrc" alt="Manc Central logo" height="94" width="94" />
        </td>
        <td class="mcccl pl-2 text-4xl font-[Verdana]">Manchester Central</td>
      </tr>
      <tr>
        <td colspan="2" class="mccc text-center py-4 text-lg">
          Manchester Central Noise Monitoring Portal.
        </td>
      </tr>
    </table>

    <!-- Buttons Table -->
    <table class="mt-8">
      <tr v-for="(central, index) in centrals" :key="index">
        <td class="py-4 text-center">
          <NuxtLink :to="central.link">
            <button
              class="button text-lg w-[200px] h-[40px] rounded-md border transition-colors duration-500"
              :class="
                isDark
                  ? 'bg-gradient-to-b from-[#7d818b] to-[#353a48] text-[#dddddd] border-[#9397a7] hover:from-black hover:to-[#7d818b] hover:text-white'
                  : 'bg-gradient-to-b from-[#d5d9e6] to-[#a4a9b9] text-black border-[#9397a7] hover:from-white hover:to-[#d5d9e6] hover:text-black'
              "
            >
              {{ central.name }}
            </button>
          </NuxtLink>
        </td>
      </tr>
    </table>

    <footer class="mt-2 py-6 text-center text-xs">
      &copy; Copyright 2026, Rational Acoustics LLC, All Rights Reserved -
      System Designed and Installed by Sterling Event Group Ltd
    </footer>
  </div>
</template>

<script>
import { useDarkMode } from "~/composables/useDarkMode";

export default {
  name: "NoiseMonitoringPage",
  data() {
    return {
      logoSrc: "/img/ManCentrallogo.png",
      centrals: [
        { name: "Central 1", link: "/views/central1" },
        { name: "Central 2", link: "/views/central2" },
        { name: "Central 3", link: "/views/central3" },
        { name: "Central 4", link: "/views/central4" },
        { name: "Exchange Hall", link: "/views/exchange" },
      ],
    };
  },
  setup() {
    const { isDark, toggle } = useDarkMode();
    const toggleDarkMode = () => toggle();
    return { isDark, toggleDarkMode };
  },
  mounted() {
    console.log("Page loaded");
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

.button {
  font-size: 1.2em;
  width: 200px;
  height: 40px;
  border-radius: 4px;
  padding: 0px 4px;
}
</style>
