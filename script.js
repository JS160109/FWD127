var totalPCs = 12;
var faultyAtStart = [3];
var currentFilter = "All";

var sessions = [
  { name: "Jeetmanyu Sharma", roll: "127", pc: "PC-05", subject: "Web Design",  time: "10:05" },
  { name: "Student Two",      roll: "128", pc: "PC-07", subject: "Programming", time: "10:10" },
  { name: "Student Three",    roll: "129", pc: "PC-02", subject: "Web Design",  time: "10:12" }
];

var seatGrid     = document.getElementById("seatGrid");
var logBody      = document.getElementById("logBody");
var formMessage  = document.getElementById("formMessage");
var sessionForm  = document.getElementById("sessionForm");

function pad(number) {
  if (number < 10) {
    return "0" + number;
  }
  return "" + number;
}

var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = "note " + type;
}

function typeText(element, text) {
  if (reduceMotion) {
    element.textContent = text;
    return;
  }
  var position = 0;
  var timer = setInterval(function () {
    position = position + 1;
    element.textContent = text.slice(0, position);
    if (position >= text.length) {
      clearInterval(timer);
    }
  }, 40);
}

function fadeIn(element) {
  if (reduceMotion) {
    element.style.opacity = 1;
    return;
  }
  var opacity = 0;
  element.style.opacity = 0;
  var timer = setInterval(function () {
    opacity = opacity + 0.05;
    element.style.opacity = opacity;
    if (opacity >= 1) {
      element.style.opacity = 1;
      clearInterval(timer);
    }
  }, 20);
}

function animateNumber(element, target) {
  clearInterval(element.timer);
  var current = Number(element.textContent);

  if (reduceMotion) {
    element.textContent = target;
    return;
  }

  element.timer = setInterval(function () {
    if (current < target) {
      current = current + 1;
    } else if (current > target) {
      current = current - 1;
    }
    element.textContent = current;
    if (current === target) {
      clearInterval(element.timer);
    }
  }, 60);
}

function popSeat(seat) {
  if (reduceMotion) {
    return;
  }
  var size = 1;
  var growing = true;
  var timer = setInterval(function () {
    if (growing) {
      size = size + 0.03;
      if (size >= 1.15) {
        growing = false;
      }
    } else {
      size = size - 0.03;
    }
    seat.style.transform = "scale(" + size + ")";
    if (size <= 1) {
      seat.style.transform = "scale(1)";
      clearInterval(timer);
    }
  }, 16);
}

function revealSections() {
  var sections = document.querySelectorAll("section");
  for (var i = 0; i < sections.length; i++) {
    sections[i].style.opacity = 0;
  }
  for (var j = 0; j < sections.length; j++) {
    (function (section, delay) {
      setTimeout(function () {
        fadeIn(section);
      }, delay);
    })(sections[j], j * 250);
  }
}

function buildSeats() {
  for (var i = 1; i <= totalPCs; i++) {
    var seat = document.createElement("button");
    seat.type = "button";
    seat.className = "seat";
    seat.textContent = "PC-" + pad(i);
    seat.id = "PC-" + pad(i);
    seat.setAttribute("aria-label", seat.textContent + " is working");

    if (faultyAtStart.indexOf(i) !== -1) {
      seat.classList.add("faulty");
    }

    seat.addEventListener("click", function () {
      this.classList.toggle("faulty");
      if (this.classList.contains("faulty")) {
        this.setAttribute("aria-label", this.textContent + " is faulty");
      } else {
        this.setAttribute("aria-label", this.textContent + " is working");
      }
      popSeat(this);
      updateCounts();
    });

    seatGrid.appendChild(seat);
  }
}

function updateCounts() {
  var faulty  = seatGrid.querySelectorAll(".faulty").length;
  var working = totalPCs - faulty;

  animateNumber(document.getElementById("statTotal"), totalPCs);
  animateNumber(document.getElementById("statWorking"), working);
  animateNumber(document.getElementById("statFaulty"), faulty);
  animateNumber(document.getElementById("statSessions"), sessions.length);
}

function addRow(session, animate) {
  var row = document.createElement("tr");
  row.setAttribute("data-subject", session.subject);

  var values = [session.name, session.roll, session.pc, session.subject, session.time];
  for (var i = 0; i < values.length; i++) {
    var cell = document.createElement("td");
    cell.textContent = values[i];
    row.appendChild(cell);
  }

  logBody.appendChild(row);

  if (animate) {
    fadeIn(row);
  }
}

function applyFilter() {
  var rows = logBody.querySelectorAll("tr");
  for (var i = 0; i < rows.length; i++) {
    var subject = rows[i].getAttribute("data-subject");
    if (currentFilter === "All" || subject === currentFilter) {
      rows[i].style.display = "";
    } else {
      rows[i].style.display = "none";
    }
  }
}

function setupFilters() {
  var buttons = document.querySelectorAll(".filter-btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      setFilter(this.getAttribute("data-filter"));
    });
  }
}

function setFilter(name) {
  currentFilter = name;
  var buttons = document.querySelectorAll(".filter-btn");
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].getAttribute("data-filter") === name) {
      buttons[i].classList.add("active");
    } else {
      buttons[i].classList.remove("active");
    }
  }
  applyFilter();
}

function setupForm() {
  sessionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var name    = document.getElementById("nameInput").value.trim();
    var roll    = document.getElementById("rollInput").value.trim();
    var pcText  = document.getElementById("pcInput").value.trim();
    var subject = document.getElementById("subjectInput").value;

    if (name === "" || roll === "" || pcText === "") {
      showMessage("Please fill in the name, roll number and PC number.", "error");
      return;
    }

    var pcNumber = Number(pcText.replace(/\D/g, ""));
    if (pcNumber < 1 || pcNumber > totalPCs || isNaN(pcNumber)) {
      showMessage("PC number must be between 1 and " + totalPCs + ".", "error");
      return;
    }
    var pcLabel = "PC-" + pad(pcNumber);

    if (document.getElementById(pcLabel).classList.contains("faulty")) {
      showMessage(pcLabel + " is faulty. Please choose another PC.", "error");
      return;
    }

    for (var i = 0; i < sessions.length; i++) {
      if (sessions[i].pc === pcLabel) {
        showMessage(pcLabel + " is already taken. Please choose another PC.", "error");
        return;
      }
    }

    var now = new Date();
    var session = {
      name: name,
      roll: roll,
      pc: pcLabel,
      subject: subject,
      time: pad(now.getHours()) + ":" + pad(now.getMinutes())
    };

    sessions.push(session);
    setFilter("All");
    addRow(session, true);
    animateNumber(document.getElementById("statSessions"), sessions.length);

    showMessage("Session added for " + name + " on " + pcLabel + ".", "success");
    sessionForm.reset();
  });
}

function setupDarkMode() {
  var button = document.getElementById("themeBtn");
  button.addEventListener("click", function () {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      button.textContent = "Light mode";
      button.setAttribute("aria-pressed", "true");
    } else {
      button.textContent = "Dark mode";
      button.setAttribute("aria-pressed", "false");
    }
  });
}

function updateClock() {
  var now = new Date();
  document.getElementById("clock").textContent =
    pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
}

typeText(document.getElementById("typingText"), "Computer lab workstation allocation and session log system");

buildSeats();

for (var i = 0; i < sessions.length; i++) {
  addRow(sessions[i], false);
}

setupFilters();
setupForm();
setupDarkMode();

updateClock();
setInterval(updateClock, 1000);

revealSections();
updateCounts();
