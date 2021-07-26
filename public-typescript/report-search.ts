import type { ptsGlobal } from "../types/publicTypes";
declare const pts: ptsGlobal;


(() => {
  pts.initializeTabs(document.querySelector("#tabs--reports"));
})();
