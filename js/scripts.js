document.addEventListener("DOMContentLoaded", function () {
  const modals = document.querySelectorAll(".modal");
  const searchInput = document.getElementById("search");
  const cards = document.querySelectorAll(".card");
  const filterBtn = document.getElementById("filter-btn");
  const addTagBtn = document.getElementById("add-tag");
  const clearFiltersBtn = document.getElementById("clear-filters");
  const tagSelect = document.getElementById("tag-select");
  const sortSelect = document.getElementById("sort-select");
  const spinner = document.getElementById("loading-spinner");
  let selectedTags = [];

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

  // Show spinner during filtering
  const showSpinner = () => {
    spinner.style.display = "block";
    setTimeout(() => {
      spinner.style.display = "none";
    }, 300); // Spinner duration
  };

  // Apply filter
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

  // Add selected tag to the filter
  addTagBtn.addEventListener("click", function () {
    const selectedTag = tagSelect.value;
    if (selectedTag && !selectedTags.includes(selectedTag)) {
      selectedTags.push(selectedTag);
      alert(`Added tag: ${selectedTag}`);
    }
  });

  // Apply combined tag filter
  filterBtn.addEventListener("click", function () {
    if (selectedTags.length > 0) {
      showSpinner();
      applyFilter(selectedTags.join("+"));
    }
  });

  // Clear all filters
  clearFiltersBtn.addEventListener("click", function () {
    selectedTags = [];
    searchInput.value = "";
    sortSelect.value = "title";
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

  // Sorting functionality
  sortSelect.addEventListener("change", function () {
    const sortBy = sortSelect.value;
    const sortedCards = Array.from(cards).sort((a, b) => {
      if (sortBy === "title") {
        return a.querySelector(".card-title").innerText.localeCompare(b.querySelector(".card-title").innerText);
      } else if (sortBy === "title-desc") {
        return b.querySelector(".card-title").innerText.localeCompare(a.querySelector(".card-title").innerText);
      } else if (sortBy === "rating") {
        return b.querySelector(".card-text strong").innerText.length - a.querySelector(".card-text strong").innerText.length;
      } else if (sortBy === "rating-desc") {
        return a.querySelector(".card-text strong").innerText.length - b.querySelector(".card-text strong").innerText.length;
      }
    });

    sortedCards.forEach(card => card.parentElement.appendChild(card));
  });

  // Default filter on load (Favorites)
  applyFilter("favorites");
});
