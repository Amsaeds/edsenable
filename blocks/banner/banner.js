function decorateBanner(el) {
  const rows = el.querySelectorAll(':scope > div');
  const [titleRow, imageRow] = rows;

  // Add a class to the title row and promote its text to a heading
  titleRow.classList.add('banner-title');
  const titleP = titleRow.querySelector(':scope > div > p');
  if (titleP) {
    const heading = document.createElement('h2');
    heading.textContent = titleP.textContent.trim();
    titleP.replaceWith(heading);
  }

  // Add a class to the image row
  imageRow.classList.add('banner-image');
}

const els = document.querySelectorAll('.banner');
els.forEach((el) => {
  decorateBanner(el);
});