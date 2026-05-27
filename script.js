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
const dialog = document.querySelector("#photoDialog");
const dialogImage = document.querySelector("#lightboxImage");
const dialogCaption = document.querySelector("#lightboxCaption");
let activePhotoIndex = 0;

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
    image.loading = index < 4 ? "eager" : "lazy";

    const label = document.createElement("span");
    label.textContent = caption;

    button.append(image, label);
    fragment.append(button);
  });

  gallery.append(fragment);
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
