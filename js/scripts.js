document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search");
  const cards = document.querySelectorAll(".card");

  searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();

    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(query) ? "block" : "none";
    });
  });

  // Initialize tabbed interface
  const favoriteTab = document.getElementById("favorites-tab");
  if (favoriteTab) {
    favoriteTab.addEventListener("click", function () {
      cards.forEach(card => {
        card.style.display = card.classList.contains("favorite") ? "block" : "none";
      });
    });
  }
});
