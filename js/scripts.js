document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search");
  const cards = document.querySelectorAll(".card");

  // Search and filter cards
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();

    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(query) ? "block" : "none";
    });
  });

  // Tab switching logic
  const favoriteTab = document.getElementById("favorites-tab");
  const allTab = document.getElementById("all-tab");

  favoriteTab.addEventListener("click", function () {
    cards.forEach(card => {
      card.style.display = card.classList.contains("favorite") ? "block" : "none";
    });
  });

  allTab.addEventListener("click", function () {
    cards.forEach(card => {
      card.style.display = "block";
    });
  });
});
