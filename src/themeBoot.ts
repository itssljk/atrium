export const THEME_BOOT_SCRIPT = `
(function () {
  try {
    var root = document.documentElement;
    root.setAttribute("data-theme", "dark");

    var accent = "sage";
    try {
      var storedAccent = window.localStorage.getItem("atrium-accent") || window.localStorage.getItem("slate-accent") || "";
      if (storedAccent) accent = storedAccent;
    } catch (e) {}
    root.setAttribute("data-accent", accent);

    try {
      var custom = window.localStorage.getItem("atrium-custom-accent");
      var auto = window.localStorage.getItem("atrium-auto-accent-color");
      if (accent === "custom" && custom) {
        root.style.setProperty("--custom-accent", custom);
      }
      if (accent === "auto" && auto) {
        root.style.setProperty("--auto-accent", auto);
      }
    } catch (e) {}
  } catch (e) {}
})();
`;
