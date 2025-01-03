document.addEventListener("DOMContentLoaded", function () {
  const modals = document.querySelectorAll(".modal");
  const searchInput = document.getElementById("search");
  const cards = document.querySelectorAll(".card");
  const favoriteTab = document.getElementById("favorites-tab");
  const allTab = document.getElementById("all-tab");

  // Ensure modals handle focus and accessibility properly
  modals.forEach(modal => {
    modal.addEventListener("shown.bs.modal", function () {
      modal.removeAttribute("aria-hidden");
    });

    modal.addEventListener("hidden.bs.modal", function () {
      modal.setAttribute("aria-hidden", "true");
    });
  });

  // Handle double-clicks or repeated clicks gracefully
  document.querySelectorAll(".thumbnail").forEach(thumbnail => {
    thumbnail.addEventListener("click", function (e) {
      const modalId = e.target.getAttribute("data-bs-target");
      const modal = document.querySelector(modalId);

      if (modal.classList.contains("show")) {
        e.stopImmediatePropagation();
      }
    });
  });

  // Initialize filters on page load (show only favorites by default)
  const applyFilter = (filter) => {
    cards.forEach(card => {
      const isFavorite = card.classList.contains("favorite");
      if (filter === "favorites" && !isFavorite) {
        card.style.display = "none";
      } else {
        card.style.display = "block";
      }
    });
  };

  // Apply favorites filter on load
  applyFilter("favorites");

  // Tab filtering logic
  favoriteTab.addEventListener("click", function () {
    applyFilter("favorites");
  });

  allTab.addEventListener("click", function () {
    applyFilter("all");
  });

  // Search functionality
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();
    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(query) ? "block" : "none";
    });
  });
});
