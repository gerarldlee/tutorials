$(document).ready(() => {});

document.addEventListener(
  "keydown",
  e => {
    let keycode = e.keyCode;
    if (keycode && keycode === 27) {
      let modals = document.querySelectorAll(".modal");

      for (let modal of modals) {
        if (modal.classList.contains("is-active")) {
          modal.classList.remove("is-active");
        }
      }
    } else if (
      (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
      e.keyCode == 83
    ) {
      e.preventDefault();
      FocusForm("searchForm", "search", true);
    }
  },
  false
);

function ShowVersionDd(e) {
  let element = e.target.parentElement;

  while (element.getAttribute("name") != "version-dropdown") {
    if (element.getAttribute("name") != "version-dropdown") {
      element = element.parentElement;
    }
  }

  if (!element.classList.contains("is-active")) {
    element.classList.add("is-active");
    e.stopPropagation();
    document.addEventListener("click", HideVersionDd, true);
  }

  return true;
}

function HideVersionDd(e) {
  if (
    !e.target.classList.contains("dropdown-content") &&
    !e.target.getAttribute("ignore")
  ) {
    let elements = document.getElementsByName("version-dropdown");
    if (elements) {
      let i = elements.length;
      while (i--) {
        const element = elements[i];
        if (element.classList.contains("is-active")) {
          element.classList.remove("is-active");
          document.removeEventListener("click", HideVersionDd, true);
        }
      }
    }
  }
}

function ShowMenu(e) {
  let menu = document.getElementById("slider-menu");
  if (menu) {
    if (menu.classList.contains("hide")) {
      menu.classList.remove("hide");
      menu.classList.add("show");

      if (e) {
        e.stopPropagation();
      }

      document.addEventListener("click", HideMenu, true);
    }
  }
}

function HideMenu(e) {
  let menu = document.getElementById("slider-menu");
  if (menu) {
    if (menu.classList.contains("show")) {
      menu.classList.remove("show");
      menu.classList.add("hide");
      document.removeEventListener("click", HideMenu, true);
    }
  }
}

let interval;
let timer;

function CloseNotification(area) {
  if (
    area == "body" &&
    document.getElementById("notification-content-right").style.display ==
      "none"
  ) {
  } else {
    ClearTimerAndInterval();
    document.getElementById("notification").style.display = "none";
  }
}

function ClearTimerAndInterval() {
  if (interval) {
    clearInterval(interval);
  }

  if (timer) {
    clearInterval(timer);
  }
}

function ShowNotification(text, timeout, css) {
  ClearTimerAndInterval();

  let notification = document.getElementById("notification");
  let right = document.getElementById("notification-content-right");
  notification.style.display = "block";
  notification.className =
    "notification notification-pop bottom is-unselectable";
  document.getElementById("notification-content").innerHTML = text;

  if (css && css != "") {
    notification.classList.add(css);
  } else {
    notification.classList.add("is-info");
  }

  if (timeout && timeout > 0) {
    right.style.display = "inherit";
    right.innerHTML = timeout / 1000;
    document.getElementById("notification-content-close").style.display =
      "none";

    let currentTime = timeout;
    interval = setInterval(() => {
      currentTime = currentTime - 1000;
      right.innerHTML = currentTime / 1000;
    }, 1000);

    timer = setTimeout(() => {
      notification.style.display = "none";
      notification.className = "";

      if (timer) {
        clearInterval(interval);
      }
    }, timeout);
  } else {
    right.style.display = "none";
    document.getElementById("notification-content-close").style.display =
      "inherit";
  }
}

var calendars;

function InitDatePicker(startDate) {
  // Initialize all input of date type.

  calendars = bulmaCalendar.attach('[type="calendar"]', {
    startDate: startDate,
    minDate: startDate,
    weekStart: 1,
    todayButton: false,
    clearButton: false
  });
}

var converter = new showdown.Converter();
