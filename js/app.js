// ==========================================
// MONEYWITHVIKAS — FRONTEND APP
// ==========================================


// ==========================================
// MOBILE NAVIGATION
// ==========================================

function toggleMenu() {
  const nav = document.querySelector("nav");
  const button = document.querySelector(".menu-toggle");

  if (!nav || !button) return;

  const isOpen = nav.classList.toggle("menu-open");

  button.setAttribute("aria-expanded", String(isOpen));
  button.setAttribute(
    "aria-label",
    isOpen ? "Close menu" : "Open menu"
  );
}


// Close mobile menu after clicking navigation link
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    const nav = document.querySelector("nav");
    const button = document.querySelector(".menu-toggle");

    if (!nav || !button) return;

    nav.classList.remove("menu-open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open menu");
  });
});

// ==========================================
// CONNECTION CARDS
// ==========================================

document.querySelectorAll(".card").forEach((card) => {

  card.addEventListener("click", () => {

    document
      .querySelectorAll(".card")
      .forEach((item) => item.classList.remove("selected"));

    card.classList.add("selected");

    const heading =
      card.querySelector("h3")?.innerText
        .replace(/\s+/g, " ")
        .trim() || "";

    let purpose = "";

    if (heading.includes("Financial")) {
      purpose = "Financial Solution";
    }
    else if (heading.includes("Work with")) {
      purpose = "Work with Vikas";
    }
    else if (heading.includes("Business")) {
      purpose = "Business Opportunity";
    }
    else if (heading.includes("Collaborate")) {
      purpose = "Collaboration";
    }
    else if (heading.includes("Network")) {
      purpose = "Join the Network";
    }
    else if (heading.includes("Meet")) {
      purpose = "Meet Vikas";
    }

    if (purpose) {

      const select =
        document.querySelector('select[name="purpose"]');

      if (select) {
        select.value = purpose;
      }

      const form =
        document.getElementById("requestForm");

      if (form) {
        form.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }

      if (select) {
        setTimeout(() => select.focus(), 500);
      }
    }

  });

});
