/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */

import type { ptsGlobal } from '../types/publicTypes.js'
declare const pts: ptsGlobal
;(() => {
  pts.initializeTabs(document.querySelector('#tabs--reports') as HTMLElement)
})()
