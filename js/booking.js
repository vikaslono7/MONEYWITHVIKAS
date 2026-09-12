// ==========================================
// MONEYWITHVIKAS — BOOKING MODULE
// ==========================================

// Add your real booking URLs here.
// Example:
// "15": "https://calendly.com/yourname/15-minute",
// "30": "https://calendly.com/yourname/30-minute"

const BOOKING_URLS = {
  "15": "",
  "30": ""
};


// ==========================================
// OPEN BOOKING
// ==========================================

function openBooking(minutes) {

  const url = BOOKING_URLS[String(minutes)];

  // Booking URL has not been configured yet
  if (!url) {

    const status = document.getElementById("formStatus");

    if (status) {
      status.className = "form-status error";

      status.textContent =
        `The ${minutes}-minute booking option is not configured yet.`;
    }

    const bookingSection =
      document.getElementById("book");

    if (bookingSection) {
      bookingSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }

    return;
  }


  // Open booking page
  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}


// ==========================================
// BOOKING BUTTONS
// ==========================================

document.querySelectorAll(".btn-slot").forEach((button) => {

  button.addEventListener("click", () => {

    const text = button.textContent;

    if (text.includes("15")) {
      openBooking(15);
    }

    else if (text.includes("30")) {
      openBooking(30);
    }

  });

});