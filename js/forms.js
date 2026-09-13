// ==========================================
// MONEYWITHVIKAS — REQUEST FORM
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  const requestForm =
    document.getElementById("requestForm");

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
    // CHECK SUPABASE CONNECTION
    // ------------------------------------------

    if (!window.mwvSupabase) {

      console.error(
        "MoneyWithVikas: Supabase client is not available."
      );

      showFormStatus(
        "error",
        "The request service is temporarily unavailable. Please try again."
      );

      return;
    }


    // ------------------------------------------
    // GET FORM DATA
    // ------------------------------------------

    const formData =
      new FormData(requestForm);


    // ------------------------------------------
    // GET CONSENT CHECKBOX
    // ------------------------------------------

    const consentCheckbox =
      requestForm.querySelector(
        'input[type="checkbox"]'
      );

    const consent =
      consentCheckbox
        ? consentCheckbox.checked
        : false;


    if (!consent) {

      showFormStatus(
        "error",
        "Please confirm the consent checkbox before submitting."
      );

      return;
    }


    // ------------------------------------------
    // PREPARE REQUEST
    // ------------------------------------------

    const requestData = {

      name:
        formData.get("name")?.trim() || "",

      phone:
        formData.get("phone")?.trim() || "",

      email:
        formData.get("email")?.trim() || "",

      purpose:
        formData.get("purpose")?.trim() || "",

      profession:
        formData.get("profession")?.trim() || "",

      location:
        formData.get("location")?.trim() || "",

      message:
        formData.get("message")?.trim() || "",

      consent: true

    };


    // ------------------------------------------
    // LOADING STATE
    // ------------------------------------------

    setLoadingState(true);

    showFormStatus("", "");


    // ------------------------------------------
    // SEND TO SUPABASE
    // ------------------------------------------

    try {

      const { error } =
        await mwvSupabase
          .from("contact_requests")
          .insert(requestData)


      // ----------------------------------------
      // SUPABASE ERROR
      // ----------------------------------------

      if (error) {

        throw error;

      }


      // ----------------------------------------
      // SUCCESS
      // ----------------------------------------

      console.log(
        "MoneyWithVikas request saved successfully.",
      );

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
        "Something went wrong while submitting your request. Please try again."
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