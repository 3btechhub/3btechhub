(() => {
  "use strict";

  const DIRECTION_KEY = "3btechhub-direction";

  function readDirection() {
    try {
      const value = localStorage.getItem(DIRECTION_KEY);
      return value === "rtl" ? "rtl" : "ltr";
    } catch {
      return "ltr";
    }
  }

  let direction = readDirection();

  function applyDirection() {
    document.documentElement.setAttribute("dir", direction);
  }

  function setDirection(value) {
    if (value !== "ltr" && value !== "rtl") return;

    direction = value;
    try {
      localStorage.setItem(DIRECTION_KEY, direction);
    } catch {
      // The current page still receives the selected direction.
    }
    applyDirection();
  }

  window.addEventListener("storage", event => {
    if (event.key === DIRECTION_KEY) {
      direction = readDirection();
      applyDirection();
    }
  });

  window.DirectionController = {
    getDirection: () => direction,
    setDirection
  };

  applyDirection();
})();