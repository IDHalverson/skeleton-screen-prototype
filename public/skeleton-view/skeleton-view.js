const containerCheckStart = Date.now();
/**
 * Check every 200ms to find a reference to the skeleton view and #root
 */
setTimeout(() => {
  const findMarkup = () => {
    if (
      document.getElementById(CONSTANTS.SKELETON_VIEW_CONTAINER_ID) &&
      document.querySelector("#root")
    ) {
      executeSkeletonLogic();
    } else {
      Date.now() - containerCheckStart <
        CONSTANTS.MAXIMUM_SKELETON_CONTAINER_CHECK_WAIT &&
        setTimeout(findMarkup, 200);
    }
  };
  findMarkup();
}, 0);
/**
 * This logic adds the extra elements that depend on which screen is present, and
 * uses setIntervals to determine when the screen is ready to be shown, and removing the skeleton view
 */
const executeSkeletonLogic = () => {
  const toAppend = CONSTANTS.APPEND_TO_ALL_SCREENS;
  const appRoot = document.querySelector("#root");
  const skeleton = document.getElementById(
    CONSTANTS.SKELETON_VIEW_CONTAINER_ID
  );
  /**
   * Append elements to the screen immediately depending on the URL route
   */
  if (toAppend) {
    toAppend.forEach((obj) => {
      const { pl = "append", ele, cond, count = 1 } = obj;
      if (!obj.hasOwnProperty("cond") || cond()) {
        [...Array(count)].fill().forEach(() => {
          const trimmed = ele.trim();
          var template = document.createElement("template");
          template.innerHTML = trimmed;
          skeleton[pl](template.content.firstChild);
        });
      }
    });
  }
  /**
   * Start the setInterval that will check for screen readiness
   */
  const start = Date.now();
  const intervalId = setInterval(() => {
    let doRemove = false;
    CONSTANTS.HOME_PAGE_LOGIC.execute();

    /**
     * Check the doRemove variable and if true, move the #root into view (use
     * display: none to avoid getting pinged for CLS) then set it display: block
     * and drop the skeleton view.
     */
    if (doRemove || Date.now() - start > CONSTANTS.MAXIMUM_SKELETON_VIEW_WAIT) {
      clearInterval(intervalId);
      // hide app
      appRoot.style.display = "none";
      // move it into viewport
      appRoot.style.left = "auto";
      appRoot.style.position = "static";
      // display app, remove skeleton
      setTimeout(() => {
        skeleton.remove();
        appRoot.style.display = "inline";
      }, 50);
    }
  }, 200);
};
