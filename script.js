const photos = [
  ["IMG_4413_Original.JPG", "Улица и подход към апартамента"],
  ["IMG_4415_Original.JPG", "Подход към входа"],
  ["IMG_4420_Original.JPG", "Тераса с маса и столове"],
  ["IMG_4422_Original.JPG", "Балкон и външна зона"],
  ["IMG_4423_Original.JPG", "Тераса за сутрешно кафе"],
  ["IMG_4424_Original.JPG", "Спалня"],
  ["IMG_4425_Original.JPG", "Спалня с гардероб"],
  ["IMG_4430_Original.JPG", "Спалня и допълнително легло"],
  ["IMG_4431_Original.JPG", "Светла спалня"],
  ["IMG_4432_Original.JPG", "Вход към спалнята"],
  ["IMG_4433_Original.JPG", "Баня"],
  ["IMG_4436_Original.JPG", "Баня с душ"],
  ["IMG_4437_Original.JPG", "Мивка и огледало"],
  ["IMG_4438_Original.JPG", "Оборудвана баня"],
  ["IMG_4439_Original.JPG", "Душ зона"],
  ["IMG_4440_Original.JPG", "Баня"],
  ["IMG_4441_Original.JPG", "Баня с бойлер"],
  ["IMG_4458_Original.JPG", "Всекидневна с ТВ"],
  ["IMG_4460_Original.JPG", "Кухненски бокс"],
  ["IMG_4461_Original.JPG", "Кухня и маса за хранене"],
  ["IMG_4462_Original.JPG", "Разтегателни дивани"],
  ["IMG_4463_Original.JPG", "Всекидневна към терасата"],
  ["IMG_4464_Original.JPG", "Кухненски уреди"],
  ["IMG_4465_Original.JPG", "Всекидневна"],
  ["IMG_4466_Original.JPG", "Кухненски кът"],
  ["IMG_4467_Original.JPG", "ТВ зона"],
  ["IMG_4468_Original.JPG", "Кухня и трапезария"]
];

const gallery = document.querySelector("#galleryGrid");
const galleryToggle = document.querySelector("[data-gallery-toggle]");
const dialog = document.querySelector("#photoDialog");
const dialogImage = document.querySelector("#lightboxImage");
const dialogCaption = document.querySelector("#lightboxCaption");
const availabilityRoot = document.querySelector("[data-availability-calendar]");
let activePhotoIndex = 0;

const availabilityConfig = {
  supabaseUrl: "https://hqmgnouwuastlsenalre.supabase.co",
  supabaseKey: "sb_publishable_TkdiVOTUPQqrkuY3UVPC1A_BYWj7KnC"
};

const visitTrackingEndpoint = `${availabilityConfig.supabaseUrl}/functions/v1/track-visit`;

const monthNames = [
  "Януари",
  "Февруари",
  "Март",
  "Април",
  "Май",
  "Юни",
  "Юли",
  "Август",
  "Септември",
  "Октомври",
  "Ноември",
  "Декември"
];

const availabilityState = {
  activeMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  reservationsByDate: new Map(),
  loaded: false
};

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (!window.location.hash) {
  window.addEventListener("load", () => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, { once: true });

  window.addEventListener("pageshow", () => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  });
}

function trackVisit() {
  const payload = {
    site: "ofrinio-holiday-site",
    path: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || ""
  };

  fetch(visitTrackingEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {});
}

function photoPath(fileName) {
  return `assets/photos/${fileName}`;
}

function openPhoto(index) {
  activePhotoIndex = index;
  const [fileName, caption] = photos[activePhotoIndex];
  dialogImage.src = photoPath(fileName);
  dialogImage.alt = caption;
  dialogCaption.textContent = caption;
  dialog.showModal();
}

function stepPhoto(direction) {
  const nextIndex = (activePhotoIndex + direction + photos.length) % photos.length;
  openPhoto(nextIndex);
}

function renderGallery() {
  const fragment = document.createDocumentFragment();

  photos.forEach(([fileName, caption], index) => {
    const button = document.createElement("button");
    button.className = "photo-tile";
    button.type = "button";
    button.setAttribute("aria-label", caption);
    button.addEventListener("click", () => openPhoto(index));

    const image = document.createElement("img");
    image.src = photoPath(fileName);
    image.alt = caption;
    image.loading = index < 8 ? "eager" : "lazy";

    const label = document.createElement("span");
    label.textContent = caption;

    button.append(image, label);
    fragment.append(button);
  });

  gallery.append(fragment);
}

function setupMobileGallery() {
  if (!gallery || !galleryToggle) return;

  const mobileQuery = window.matchMedia("(max-width: 640px)");

  function applyState() {
    if (mobileQuery.matches && !gallery.dataset.expanded) {
      gallery.classList.add("is-collapsed");
      galleryToggle.hidden = false;
      galleryToggle.textContent = `Покажи всички снимки (${photos.length})`;
    } else {
      gallery.classList.remove("is-collapsed");
      galleryToggle.hidden = !mobileQuery.matches;
      galleryToggle.textContent = "Скрий част от снимките";
    }
  }

  galleryToggle.addEventListener("click", () => {
    if (gallery.dataset.expanded) {
      delete gallery.dataset.expanded;
      document.querySelector("#gallery").scrollIntoView({ block: "start" });
    } else {
      gallery.dataset.expanded = "true";
    }
    applyState();
  });

  mobileQuery.addEventListener("change", applyState);
  applyState();
}

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function statusForDate(statuses) {
  const activeStatuses = statuses.filter((status) => status !== "Отменена");
  const booked = activeStatuses.some((status) => status !== "Чакаща");
  const pending = !booked && activeStatuses.some((status) => status === "Чакаща");

  if (booked) return { className: "booked", full: "Заето", short: "Заето" };
  if (pending) return { className: "pending", full: "Запитване", short: "Чака" };
  return { className: "free", full: "Свободно", short: "Св." };
}

function renderAvailabilityCalendar() {
  if (!availabilityRoot) return;

  const title = availabilityRoot.querySelector("[data-calendar-title]");
  const status = availabilityRoot.querySelector("[data-calendar-status]");
  const grid = availabilityRoot.querySelector("[data-calendar-grid]");
  const year = availabilityState.activeMonth.getFullYear();
  const month = availabilityState.activeMonth.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  title.textContent = `${monthNames[month]} ${year}`;
  status.textContent = availabilityState.loaded
    ? "Само за преглед - без редакция"
    : "Зареждане...";

  grid.replaceChildren();

  for (let index = 0; index < firstDay; index += 1) {
    const empty = document.createElement("div");
    empty.className = "availability-day empty";
    grid.append(empty);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = dateKey(year, month, day);
    const statuses = availabilityState.reservationsByDate.get(key) || [];
    const dayStatus = statusForDate(statuses);
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    const cell = document.createElement("div");

    cell.className = `availability-day ${dayStatus.className}${isToday ? " today" : ""}`;
    cell.setAttribute("aria-label", `${day} ${monthNames[month]} ${year}: ${dayStatus.full}`);
    cell.innerHTML = `
      <span class="availability-day-number">${day}</span>
      <span class="availability-pill">
        <span class="availability-label-full">${dayStatus.full}</span>
        <span class="availability-label-short">${dayStatus.short}</span>
      </span>
    `;

    grid.append(cell);
  }
}

async function loadAvailability() {
  if (!availabilityRoot) return;

  try {
    const headers = {
      apikey: availabilityConfig.supabaseKey,
      Authorization: `Bearer ${availabilityConfig.supabaseKey}`
    };
    const endpoints = [
      `${availabilityConfig.supabaseUrl}/rest/v1/public_availability?select=date,status&order=date.asc`,
      `${availabilityConfig.supabaseUrl}/rest/v1/reservations?select=date,status&order=date.asc`
    ];

    let rows = null;

    for (const endpoint of endpoints) {
      const response = await fetch(endpoint, { headers });
      if (!response.ok) continue;
      rows = await response.json();
      break;
    }

    if (!rows) throw new Error("availability request failed");
    const grouped = new Map();

    rows.forEach((row) => {
      if (!row.date) return;
      const statuses = grouped.get(row.date) || [];
      statuses.push(row.status || "Потвърдена");
      grouped.set(row.date, statuses);
    });

    availabilityState.reservationsByDate = grouped;
    availabilityState.loaded = true;
    renderAvailabilityCalendar();
  } catch {
    availabilityState.loaded = true;
    const status = availabilityRoot.querySelector("[data-calendar-status]");
    status.textContent = "Неуспешно зареждане - обадете се за свободни дати";
  }
}

function setupAvailabilityCalendar() {
  if (!availabilityRoot) return;

  availabilityRoot.querySelector("[data-calendar-prev]").addEventListener("click", () => {
    availabilityState.activeMonth = new Date(
      availabilityState.activeMonth.getFullYear(),
      availabilityState.activeMonth.getMonth() - 1,
      1
    );
    renderAvailabilityCalendar();
  });

  availabilityRoot.querySelector("[data-calendar-next]").addEventListener("click", () => {
    availabilityState.activeMonth = new Date(
      availabilityState.activeMonth.getFullYear(),
      availabilityState.activeMonth.getMonth() + 1,
      1
    );
    renderAvailabilityCalendar();
  });

  renderAvailabilityCalendar();
  loadAvailability();
}

document.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-dialog]")) dialog.close();
  if (event.target.matches("[data-photo-prev]")) stepPhoto(-1);
  if (event.target.matches("[data-photo-next]")) stepPhoto(1);
});

document.addEventListener("keydown", (event) => {
  if (!dialog.open) return;
  if (event.key === "ArrowLeft") stepPhoto(-1);
  if (event.key === "ArrowRight") stepPhoto(1);
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

renderGallery();
setupMobileGallery();
setupAvailabilityCalendar();
trackVisit();
