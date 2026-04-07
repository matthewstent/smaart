<template>
  <div>
    <canvas ref="canvas"></canvas>

    <div>
      <label>Select metrics:</label>
      <select multiple @change="onMetricChange">
        <option v-for="name in metricOptions" :key="name" :value="name">
          {{ name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useMetricsChart } from "~/composables/useMetricsChart";

export default {
  name: "MetricsChart",

  data() {
    return {
      canvas: null,
      wsUrl: "wss://smaart.msct.dev/ws/",
      chartRef: null,
      chartInstance: null,
      messageArray: [],
      selectedMetrics: [],
      metricOptions: [],
    };
  },

  methods: {
    onMetricChange(event) {
      const selected = Array.from(event.target.selectedOptions).map(
        (o) => o.value,
      );
      this.selectedMetrics = selected;
      this.setSelectedMetrics(selected);
    },
  },

  mounted() {
    // Initialize composable
    const { chartRef, initChart, setSelectedMetrics, messageArray } =
      useMetricsChart(this.wsUrl, 30, 8);

    this.chartRef = chartRef;
    this.chartInstance = initChart(this.$refs.canvas);
    this.setSelectedMetrics = setSelectedMetrics;
    this.messageArray = messageArray;

    // Watch messageArray and update metric options
    this.$watch(
      () => this.messageArray.length,
      () => {
        if (this.messageArray.length) {
          // messageArray[0][0] contains the first metric object array
          this.metricOptions = this.messageArray[0][0].map(
            (m) => Object.keys(m)[0],
          );
        }
      },
    );
  },
};
</script>
