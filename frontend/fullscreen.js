export { initFullScreen };

function initFullScreen(document) {
  const fullScreen = document.getElementById("fullScreen");

  fullScreen.addEventListener("click", haddleFullScreen);
  function haddleFullScreen() {
    toggleFullScreen(document);
  }

  let openBtn = document.getElementById("nav-open");
  let closeBtn = document.getElementById("nav-close");
  let navWrapper = document.getElementById("nav-wrapper");
  let navLatteral = document.getElementById("nav-latteral");

  const openNav = () => {
    navWrapper.classList.add("active");
    navLatteral.style.left = "0";
  };

  const closeNav = () => {
    navWrapper.classList.remove("active");
    navLatteral.style.left = "-100%";
  };

  openBtn.addEventListener("click", openNav);
  closeBtn.addEventListener("click", closeNav);
  navWrapper.addEventListener("click", closeNav);
}

function toggleFullScreen(document) {
  if (document.fullscreenElement) {
    localStorage.removeItem("fullScreen");
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen();
    }
  } else {
    localStorage.setItem("fullScreen", true);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      /* Safari */
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      /* IE11 */
      document.documentElement.msRequestFullscreen();
    }
  }
}
