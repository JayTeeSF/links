document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search");
  const cards = document.querySelectorAll(".card");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const modals = document.querySelectorAll(".modal");

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

  // Apply filter logic
  const applyFilter = (filter) => {
    cards.forEach(card => {
      const tags = card.dataset.tags.split(",").map(tag => tag.trim().toLowerCase());
      const isFavorite = card.classList.contains("favorite");

      if (filter === "all") {
        card.style.display = "block";
      } else if (filter === "favorites") {
        card.style.display = isFavorite ? "block" : "none";
      } else {
        const filterTags = filter.split("+").map(tag => tag.trim().toLowerCase());
        const matches = filterTags.every(tag => tags.includes(tag));
        card.style.display = matches ? "block" : "none";
      }
    });
  };

  // Filter cards based on button click
  filterButtons.forEach(button => {
    button.addEventListener("click", function () {
      const filter = button.dataset.filter;
      applyFilter(filter);
    });
  });

  // Search functionality
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();
    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(query) ? "block" : "none";
    });
  });

  // Default filter on load (Favorites)
  applyFilter("favorites");
});
