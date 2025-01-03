document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search");
  const cards = document.querySelectorAll(".card");

  searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();

    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      const matches = text.includes(query);
      card.style.display = matches ? "block" : "none";
    });
  });
});
