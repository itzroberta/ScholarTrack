const calendarEl = document.getElementById("calendar");
const today = dayjs();
const currentMonth = today.month();
const currentYear = today.year();
const daysInMonth = dayjs().daysInMonth();
const todayKey = `${currentYear}-${currentMonth + 1}-${today.date()}`;

// Função para renderizar o calendário
function renderCalendar() {
  calendarEl.innerHTML = ""; // limpa o conteúdo anterior

  const calendarGrid = document.createElement("div");
  calendarGrid.classList.add("calendar-grid");

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
  weekDays.forEach((day) => {
    const dayEl = document.createElement("div");
    dayEl.classList.add("day-header");
    dayEl.textContent = day;
    calendarGrid.appendChild(dayEl);
  });

  const firstDay = dayjs(`${currentYear}-${currentMonth + 1}-01`).day();
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("empty");
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement("div");
    dayCell.classList.add("day-cell");
    dayCell.textContent = day;

    const key = `${currentYear}-${currentMonth + 1}-${day}`;
    const hasProgress = localStorage.getItem(key) === "true";

    if (hasProgress) {
      dayCell.classList.add("completed");
    }

    if (day === today.date()) {
      dayCell.classList.add("today");
    }

    calendarGrid.appendChild(dayCell);
  }

  calendarEl.appendChild(calendarGrid);
}

renderCalendar();

// Botão de check-in
const checkinBtn = document.getElementById("checkin-btn");

// Verifica se já foi feito o check-in hoje
const alreadyCheckedIn = localStorage.getItem(todayKey) === "true";

if (alreadyCheckedIn) {
  checkinBtn.textContent = "✅ Check-in Done";
  checkinBtn.disabled = true;
  checkinBtn.style.opacity = 0.6;
  checkinBtn.style.cursor = "default";
} else {
  checkinBtn.addEventListener("click", () => {
    localStorage.setItem(todayKey, "true");
    renderCalendar();

    checkinBtn.textContent = "✅ Check-in Done";
    checkinBtn.disabled = true;
    checkinBtn.style.opacity = 0.6;
    checkinBtn.style.cursor = "default";
  });
}