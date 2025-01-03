document.addEventListener("DOMContentLoaded", function () {
  const modals = document.querySelectorAll(".modal");

  modals.forEach(modal => {
    modal.addEventListener("shown.bs.modal", function () {
      // Ensure focus is trapped inside the modal
      modal.removeAttribute("aria-hidden");
    });

    modal.addEventListener("hidden.bs.modal", function () {
      // Reset the modal to prevent focus issues
      modal.setAttribute("aria-hidden", "true");
    });
  });

  // Handle double-clicks or repeated clicks gracefully
  document.querySelectorAll(".thumbnail").forEach(thumbnail => {
    thumbnail.addEventListener("click", function (e) {
      const modalId = e.target.getAttribute("data-bs-target");
      const modal = document.querySelector(modalId);

      if (modal.classList.contains("show")) {
        // Prevent reopening the already open modal
        e.stopImmediatePropagation();
      }
    });
  });

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
