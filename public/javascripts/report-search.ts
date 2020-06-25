import type { ptsGlobal } from "./types";
declare const pts: ptsGlobal;


(() => {
  pts.initializeTabs(document.getElementById("tabs--reports"));
})();
