import { ref, watch } from "vue";

export const useDarkMode = () => {
  const isDark = ref(true); // <-- default to dark mode

  const updateHtmlClass = (dark) => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };
  if (process.client) {
    const stored = localStorage.getItem("dark-mode");
    if (stored !== null) {
      isDark.value = stored === "true";
    }
    updateHtmlClass(isDark.value);
  }

  const toggle = () => {
    isDark.value = !isDark.value;
  };

  watch(isDark, (val) => {
    if (process.client) {
      localStorage.setItem("dark-mode", val);
      updateHtmlClass(val);
    }
  });

  return { isDark, toggle };
};
