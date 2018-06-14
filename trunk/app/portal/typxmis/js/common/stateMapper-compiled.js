define(function () {
  "use strict";
  return { "modules": [{ "reconfig": true, "name": "app.states.portal.index", "files": ["./typxmis/js/states/index-state"] }, { "reconfig": true, "name": "app.states.portal.index.teleUs", "files": ["./typxmis/js/states/index.teleUs-state"] }], "futureStates": [{ "module": "app.states.portal.index", "stateName": "states.index", "url": "/index", "type": "ocLazyLoad" }, { "module": "app.states.portal.index.teleUs", "stateName": "states.index.teleUs", "url": "/index.teleUs", "type": "ocLazyLoad" }] };
});

//# sourceMappingURL=stateMapper-compiled.js.map