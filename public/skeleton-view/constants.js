({
  /**
   * GLOBAL CONSTANTS
   */
  MAXIMUM_SKELETON_CONTAINER_CHECK_WAIT: 5000,
  MAXIMUM_SKELETON_VIEW_WAIT: 5000,
  SKELETON_VIEW_CONTAINER_ID: "skeleton",
  MAIN_IMAGE_ID: "main-image",
  APPEND_TO_ALL_SCREENS: [
    // Example:
    // {
    //   ele: '<div class="some-class"></div>',
    //   count: 1,
    //   cond: () => window.innerWidth >= 400
    // },
  ],
  UNUSED_FUNCTION: {
    get: () => window.innerWidth >= 800 /*This is just an example of how to add 
      a function constant. These get statically 
      inserted into the script, so don't use an 
      arrow function or this will happen:*/,
  },

  /**
   * SCREEN-SPECIFIC CONSTANTS
   */
  // This syntax is necessary to avoid parsing errors after injection into the script.
  // CONSTANTS.HOME_PAGE_LOGIC.execute();
  //          becomes
  // (() => ({ execute: () => {/*my logic*/} }))().execute();
  HOME_PAGE_LOGIC: (() => ({
    execute: () => {
      const mainImage = document.querySelector(`#${CONSTANTS.MAIN_IMAGE_ID}`);
      if (mainImage && mainImage.complete) {
        doRemove = true;
      }
    },
  }))(),
  /**
   * Add more screen logic below as needed for each screen.
   */
});
