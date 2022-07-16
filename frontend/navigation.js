export { initNavigation };

function initNavigation(document) {
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
