// ==========================================
// MONEYWITHVIKAS — REQUEST FORM
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  const requestForm = document.getElementById("requestForm");

  if (!requestForm) return;

  const submitButton =
    document.getElementById("submitRequest");

  const formStatus =
    document.getElementById("formStatus");


  // ==========================================
  // FORM SUBMISSION
  // ==========================================

  requestForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!requestForm.checkValidity()) {

      requestForm.reportValidity();

      showFormStatus(
        "error",
        "Please complete all required fields."
      );

      return;
    }


    // ------------------------------------------
    // LOADING STATE
    // ------------------------------------------

    setLoadingState(true);


    // ------------------------------------------
    // TEMPORARY FRONTEND SUBMISSION
    // ------------------------------------------
    //
    // This will be replaced with the real
    // backend/API connection in the next phase.
    //

    try {

      await new Promise((resolve) => {
        setTimeout(resolve, 700);
      });


      // ----------------------------------------
      // SUCCESS
      // ----------------------------------------

      showFormStatus(
        "success",
        "Your request has been received successfully. Our team will get back to you."
      );

      requestForm.reset();


    } catch (error) {

      console.error(
        "MoneyWithVikas form error:",
        error
      );

      showFormStatus(
        "error",
        "Something went wrong. Please try again."
      );

    } finally {

      setLoadingState(false);

    }

  });


  // ==========================================
  // LOADING STATE
  // ==========================================

  function setLoadingState(isLoading) {

    if (!submitButton) return;

    if (isLoading) {

      submitButton.disabled = true;

      submitButton.classList.add("is-loading");

      submitButton.textContent =
        "Sending…";

    } else {

      submitButton.disabled = false;

      submitButton.classList.remove("is-loading");

      submitButton.textContent =
        "✈ Send Request →";

    }

  }


  // ==========================================
  // FORM STATUS
  // ==========================================

  function showFormStatus(type, message) {

    if (!formStatus) return;

    formStatus.className =
      `form-status ${type}`;

    formStatus.textContent =
      message;

  }

});