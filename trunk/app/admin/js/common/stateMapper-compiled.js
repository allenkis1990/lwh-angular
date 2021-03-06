define(function () {
  "use strict";
  return { "modules": [{ "reconfig": true, "name": "app.states.admin.home", "files": ["states/home-state"] }, { "reconfig": true, "name": "app.states.admin.releaseGoods", "files": ["states/releaseGoods-state"] }], "futureStates": [{ "module": "app.states.admin.home", "stateName": "states.home", "url": "/home", "type": "ocLazyLoad" }, { "module": "app.states.admin.releaseGoods", "stateName": "states.releaseGoods", "url": "/releaseGoods", "type": "ocLazyLoad" }] };
});

//# sourceMappingURL=stateMapper-compiled.js.map