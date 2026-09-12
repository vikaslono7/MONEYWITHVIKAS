// ==========================================
// MONEYWITHVIKAS — FRONTEND APP
// ==========================================

const BOOKING_URLS = {
  "15": "", // Add your 15-minute booking URL
  "30": ""  // Add your 30-minute booking URL
};


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
// BOOKING
// ==========================================

function openBooking(minutes) {

  const url = BOOKING_URLS[minutes];

  if (!url) {

    const status = document.getElementById("formStatus");

    if (status) {
      status.className = "form-status error";
      status.textContent =
        `Booking is ready to connect. Add your ${minutes}-minute calendar URL in BOOKING_URLS in app.js.`;
    }

    const form = document.getElementById("requestForm");

    if (form) {
      form.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }

    return;
  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}


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


// ==========================================
// REQUEST FORM
// ==========================================

const requestForm =
  document.getElementById("requestForm");

if (requestForm) {

  requestForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const form = event.currentTarget;

    const button =
      document.getElementById("submitRequest");

    const status =
      document.getElementById("formStatus");


    // Validate required fields
    if (!form.checkValidity()) {

      form.reportValidity();

      if (status) {
        status.className = "form-status error";
        status.textContent =
          "Please complete all required fields.";
      }

      return;
    }


    // Loading state
    if (button) {
      button.classList.add("is-loading");
      button.textContent = "Sending…";
    }

    if (status) {
      status.className = "form-status";
      status.textContent = "";
    }


    // Temporary frontend demo
    await new Promise((resolve) => {
      setTimeout(resolve, 700);
    });


    // Success state
    if (button) {
      button.classList.remove("is-loading");
      button.textContent = "✓ Request Ready";
    }

    if (status) {
      status.className = "form-status success";

      status.textContent =
        "Your request has been validated. Backend connection will be added next.";
    }


    form.reset();


    // Restore button
    setTimeout(() => {

      if (button) {
        button.textContent = "✈ Send Request →";
      }

    }, 2200);

  });

}