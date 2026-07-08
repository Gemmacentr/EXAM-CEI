"use strict";
//loader
const counter = document.getElementById("counter");
const progressBar = document.getElementById("progressBar");
const Loader = document.getElementById("Loader");
const siteContent = document.getElementById("site-content");

if (sessionStorage.getItem("loaded")) {
  Loader.classList.add("hidden");
  siteContent.classList.add("visible");
  document.body.style.overflow = "auto";
} else {
  sessionStorage.setItem("loaded", "true");

  let progress = 0;
  const loading = setInterval(() => {
    progress++;
    counter.textContent = progress;
    progressBar.style.width = progress + "%";

    if (progress >= 100) {
      clearInterval(loading);

      setTimeout(() => {
        Loader.classList.add("hidden");
        siteContent.classList.add("visible");
        document.body.style.overflow = "auto";
      }, 500);
    }
  }, 60);
}

//navbar
const firstNav = document.querySelector(".Nav-list");
const secondNav = document.querySelector(".Second-nav");
const navHamburger = document.querySelector(".Nav-hamburger");
const navList = document.querySelector(".Nav-list");
const navItems = document.querySelectorAll(".Nav-items");
const navigationTrigger = document.querySelector(".Navigation-trigger");
const navLogo = document.querySelector(".Nav-logo");
navigationTrigger.addEventListener("click", () => {
  firstNav.classList.toggle("isOpen");
  secondNav.classList.toggle("isOpen");
  navHamburger.classList.toggle("isOpen");
  navigationTrigger.classList.toggle("isOpen");
  navLogo.classList.toggle("isOpen");
  navList.classList.toggle("isOpen");
  navItems.forEach((item) => item.classList.toggle("isOpen"));
});
//second Nav
const navLinks = document.querySelectorAll(".Nav-items-second-nav a");

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const target = document.querySelector(link.getAttribute("href"));

    // animazione dello sfondo
    secondNav.classList.add("isClosing");

    setTimeout(() => {
      target.scrollIntoView({
        behavior: "smooth",
      });

      secondNav.classList.remove("isOpen");
      secondNav.classList.remove("isClosing");
      navHamburger.classList.remove("isOpen");
      navigationTrigger.classList.remove("isOpen");
      navLogo.classList.remove("isOpen");
    }, 800);
  });
});
//Cursor
const Cursor = document.querySelector(".Cursor");

document.addEventListener("mousemove", (e) => {
  Cursor.style.left = e.clientX + "px";
  Cursor.style.top = e.clientY + "px";
});
