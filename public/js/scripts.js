document.addEventListener("DOMContentLoaded", function () {
  // Track clicks on links
  document.querySelectorAll(".card a").forEach(link => {
    link.addEventListener("click", function () {
      const payload = {
        url: link.href,
        timestamp: new Date().toISOString(),
        action: "click"
      };
      navigator.sendBeacon("https://example.com/track", JSON.stringify(payload));
    });
  });

  // Track favorites
  document.querySelectorAll(".favorite-toggle").forEach(button => {
    button.addEventListener("click", function () {
      const payload = {
        url: button.dataset.url,
        timestamp: new Date().toISOString(),
        action: "favorite"
      };
      navigator.sendBeacon("https://example.com/track", JSON.stringify(payload));
    });
  });
});
