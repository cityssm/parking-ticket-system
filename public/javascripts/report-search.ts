import type { ptsGlobal } from "../../types/publicTypes";
declare const pts: ptsGlobal;


(() => {
  pts.initializeTabs(document.getElementById("tabs--reports"));
})();
