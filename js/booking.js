/* =========================================================
   MONEYWITHVIKAS — DYNAMIC BOOKING SYSTEM
   PHASE 2.12C-2B
   LIVE ADMIN SETTINGS + SECURE BOOKING RPC
   ========================================================= */

(function () {
  "use strict";

  let bookingSettings = null;
  let selectedDuration = 15;
  let selectedTime = null;
  let bookedSlots = [];
  let settingsPromise = null;

  const modal = document.getElementById("bookingModal");
  const overlay = document.getElementById("bookingOverlay");
  const closeButton = document.getElementById("bookingClose");

  const form = document.getElementById("bookingForm");
  const durationInput = document.getElementById("bookingDuration");
  const durationDisplay = document.getElementById("selectedDuration");

  const dateInput = document.getElementById("bookingDate");
  const bookingDay = document.getElementById("bookingDay");
  const bookingDateSummary =
    document.getElementById("bookingDateSummary");

  const timeSelect =
    document.getElementById("bookingTimeSelect");

  const timeInput =
    document.getElementById("bookingTime");

  const nameInput =
    document.getElementById("bookingName");

  const phoneInput =
    document.getElementById("bookingPhone");

  const emailInput =
    document.getElementById("bookingEmail");

  const notesInput =
    document.getElementById("bookingNotes");

  const consentInput =
    document.getElementById("bookingConsent");

  const statusBox =
    document.getElementById("bookingStatus");

  const submitButton =
    document.getElementById("bookingSubmit");

  const successBox =
    document.getElementById("bookingSuccess");

  const referenceBox =
    document.getElementById("bookingReference");

  const doneButton =
    document.getElementById("bookingDone");


  /* =========================================================
     BASIC UI CHECK
     ========================================================= */

  if (!modal || !form || !dateInput) {
    console.error(
      "MoneyWithVikas booking UI not found."
    );
    return;
  }


  /* =========================================================
     LIVE PUBLIC BOOKING SETTINGS
     ========================================================= */

  async function loadBookingSettings(forceRefresh = false) {

    if (!window.mwvSupabase) {
      throw new Error(
        "Booking system is not connected."
      );
    }

    if (bookingSettings && !forceRefresh) {
      return bookingSettings;
    }

    if (settingsPromise && !forceRefresh) {
      return settingsPromise;
    }

    settingsPromise =
      window.mwvSupabase
        .rpc("get_public_booking_settings")
        .then(({ data, error }) => {

          if (error) {
            console.error(
              "Booking settings error:",
              error
            );

            throw new Error(
              "Unable to load booking settings."
            );
          }

          const settings =
            Array.isArray(data)
              ? data[0]
              : data;

          if (!settings) {
            throw new Error(
              "Booking settings are unavailable."
            );
          }

          bookingSettings = settings;

          return settings;

        })
        .finally(() => {
          settingsPromise = null;
        });

    return settingsPromise;
  }


  function getTimezone() {

    return (
      bookingSettings?.timezone ||
      "Asia/Kolkata"
    );
  }


  function timeToMinutes(timeString) {

    if (!timeString) {
      return 0;
    }

    const [
      hours,
      minutes
    ] =
      timeString
        .split(":")
        .map(Number);

    return (
      hours * 60 +
      minutes
    );
  }


  function minutesToTime(totalMinutes) {

    const hours =
      Math.floor(
        totalMinutes / 60
      );

    const minutes =
      totalMinutes % 60;

    return (
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}`
    );
  }


  /* =========================================================
     DATE HELPERS
     ========================================================= */

  function getTodayInConfiguredTimezone() {

    const parts =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone: getTimezone(),
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }
      ).formatToParts(
        new Date()
      );

    const year =
      parts.find(
        p => p.type === "year"
      )?.value;

    const month =
      parts.find(
        p => p.type === "month"
      )?.value;

    const day =
      parts.find(
        p => p.type === "day"
      )?.value;

    return (
      `${year}-${month}-${day}`
    );
  }


  function getDayOfWeek(dateString) {

    /*
     * Noon UTC prevents timezone-related
     * date shifting for date-only values.
     */

    return new Date(
      `${dateString}T12:00:00Z`
    ).getUTCDay();
  }


  function getDaySetting(dateString) {

    if (!bookingSettings) {
      return {
        online: false,
        reason: "settings"
      };
    }

    const day =
      getDayOfWeek(
        dateString
      );

    switch (day) {

      case 1:
        return {
          online:
            !!bookingSettings.monday_enabled,
          reason:
            bookingSettings.monday_enabled
              ? null
              : "weekday"
        };

      case 2:
        return {
          online:
            !!bookingSettings.tuesday_enabled,
          reason:
            bookingSettings.tuesday_enabled
              ? null
              : "weekday"
        };

      case 3:
        return {
          online:
            !!bookingSettings.wednesday_enabled,
          reason:
            bookingSettings.wednesday_enabled
              ? null
              : "weekday"
        };

      case 4:
        return {
          online:
            !!bookingSettings.thursday_enabled,
          reason:
            bookingSettings.thursday_enabled
              ? null
              : "weekday"
        };

      case 5:
        return {
          online:
            !!bookingSettings.friday_enabled,
          reason:
            bookingSettings.friday_enabled
              ? null
              : "weekday"
        };

      case 6:
        return {
          online:
            bookingSettings.saturday_mode ===
            "online",
          reason:
            bookingSettings.saturday_mode
        };

      case 0:
        return {
          online:
            bookingSettings.sunday_mode ===
            "online",
          reason:
            bookingSettings.sunday_mode
        };

      default:
        return {
          online: false,
          reason: "unavailable"
        };
    }
  }


  function isBookingDay(dateString) {

    return getDaySetting(
      dateString
    ).online;
  }


  function getUnavailableDayMessage(
    dateString
  ) {

    const setting =
      getDaySetting(
        dateString
      );

    const day =
      getDayOfWeek(
        dateString
      );

    if (
      setting.reason ===
      "meetings_only"
    ) {

      if (day === 6) {
        return (
          "Saturday is reserved for meetings. " +
          "Please select another date."
        );
      }

      return (
        "This day is reserved for meetings. " +
        "Please select another date."
      );
    }


    if (day === 0) {

      return (
        "Sunday is unavailable for online bookings. " +
        "Please select another date."
      );
    }


    if (day === 6) {

      return (
        "Saturday is unavailable for online bookings. " +
        "Please select another date."
      );
    }


    return (
      "Online bookings are unavailable on the selected day. " +
      "Please select another date."
    );
  }


  function formatSelectedDate(
    dateString
  ) {

    if (!dateString) {
      return;
    }

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    const [
      year,
      month,
      day
    ] =
      dateString
        .split("-")
        .map(Number);


    const date =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day,
          12,
          0,
          0
        )
      );


    const dayName =
      dayNames[
        date.getUTCDay()
      ];


    const monthName =
      monthNames[
        month - 1
      ];


    if (bookingDay) {

      bookingDay.textContent =
        dayName;
    }


    if (bookingDateSummary) {

      bookingDateSummary.textContent =
        `${dayName} • ${day} ${monthName} ${year}`;
    }
  }


  function getNextBookingDate() {

    const today =
      getTodayInConfiguredTimezone();

    const startDate =
      new Date(
        `${today}T12:00:00Z`
      );


    for (
      let i = 0;
      i < 370;
      i++
    ) {

      const date =
        new Date(startDate);

      date.setUTCDate(
        date.getUTCDate() + i
      );


      const year =
        date.getUTCFullYear();

      const month =
        String(
          date.getUTCMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          date.getUTCDate()
        ).padStart(2, "0");


      const dateString =
        `${year}-${month}-${day}`;


      if (
        isBookingDay(
          dateString
        )
      ) {

        return dateString;
      }
    }


    return today;
  }


  /* =========================================================
     TIME HELPERS
     ========================================================= */

  function formatTime(
    timeString
  ) {

    const [
      hour,
      minute
    ] =
      timeString
        .split(":")
        .map(Number);


    const date =
      new Date();

    date.setHours(
      hour,
      minute,
      0,
      0
    );


    return new Intl.DateTimeFormat(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }
    ).format(date);
  }


  function overlaps(
    startA,
    durationA,
    startB,
    durationB
  ) {

    const startMinutesA =
      timeToMinutes(
        startA
      );

    const startMinutesB =
      timeToMinutes(
        startB
      );


    const endA =
      startMinutesA +
      durationA;

    const endB =
      startMinutesB +
      durationB;


    return (
      startMinutesA < endB &&
      startMinutesB < endA
    );
  }


  /* =========================================================
     OPEN BOOKING MODAL
     ========================================================= */

  window.openBooking =
    async function (duration) {

      const requestedDuration =
        Number(duration) === 30
          ? 30
          : 15;


      modal.classList.add(
        "open"
      );


      modal.setAttribute(
        "aria-hidden",
        "false"
      );


      document.body.style.overflow =
        "hidden";


      showLoading(
        "Loading booking availability..."
      );


      try {

        await loadBookingSettings(
          true
        );


        selectedDuration =
          requestedDuration;


        const durationAllowed =
          selectedDuration === 15
            ? !!bookingSettings.duration_15_enabled
            : !!bookingSettings.duration_30_enabled;


        if (!durationAllowed) {

          showError(
            `${selectedDuration}-minute bookings are currently unavailable.`
          );

          renderInitialSlots();

          return;
        }


        selectedTime = null;


        durationInput.value =
          selectedDuration;


        durationDisplay.textContent =
          `${selectedDuration} Minutes`;


        timeInput.value = "";


        if (timeSelect) {

          timeSelect.value = "";
        }


        clearStatus();


        form.hidden = false;

        successBox.hidden = true;


        dateInput.min =
          getTodayInConfiguredTimezone();


        if (
          !dateInput.value ||
          !isBookingDay(
            dateInput.value
          )
        ) {

          dateInput.value =
            getNextBookingDate();
        }


        formatSelectedDate(
          dateInput.value
        );


        renderInitialSlots();


        setTimeout(() => {

          dateInput.focus();

        }, 50);


        await loadAvailability();


      } catch (error) {

        console.error(
          "MoneyWithVikas booking initialization error:",
          error
        );


        showError(
          error.message ||
          "Unable to load booking settings. Please try again."
        );


        renderInitialSlots();
      }
    };


  /* =========================================================
     CLOSE MODAL
     ========================================================= */

  function closeBooking() {

    modal.classList.remove(
      "open"
    );


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.style.overflow =
      "";


    clearStatus();
  }


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeBooking
    );
  }


  if (overlay) {

    overlay.addEventListener(
      "click",
      closeBooking
    );
  }


  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape" &&
        modal.classList.contains(
          "open"
        )
      ) {

        closeBooking();
      }
    }
  );


  if (doneButton) {

    doneButton.addEventListener(
      "click",
      closeBooking
    );
  }


  /* =========================================================
     DATE CHANGE
     ========================================================= */

  dateInput.addEventListener(
    "change",
    async function () {

      selectedTime = null;


      timeInput.value = "";


      if (timeSelect) {

        timeSelect.value = "";
      }


      clearStatus();


      formatSelectedDate(
        dateInput.value
      );


      if (!dateInput.value) {

        renderInitialSlots();

        return;
      }


      const today =
        getTodayInConfiguredTimezone();


      if (
        dateInput.value < today
      ) {

        showError(
          "Please select today or a future date."
        );


        renderInitialSlots();

        return;
      }


      if (
        !isBookingDay(
          dateInput.value
        )
      ) {

        showError(
          getUnavailableDayMessage(
            dateInput.value
          )
        );


        renderInitialSlots();

        return;
      }


      await loadAvailability();
    }
  );


  /* =========================================================
     INITIAL TIME DROPDOWN
     ========================================================= */

  function renderInitialSlots() {

    if (!timeSelect) {
      return;
    }


    timeSelect.innerHTML = `
      <option value="">
        Select an available time
      </option>
    `;


    timeSelect.disabled = true;


    selectedTime = null;


    timeInput.value = "";
  }


  function showLoading(
    message
  ) {

    if (!statusBox) {
      return;
    }


    statusBox.textContent =
      message;


    statusBox.className =
      "booking-status success";
  }


  /* =========================================================
     LOAD BOOKED SLOTS
     ========================================================= */

  async function loadAvailability() {

    if (!window.mwvSupabase) {

      showError(
        "Booking system is not connected. Please try again."
      );

      return;
    }


    if (!bookingSettings) {

      await loadBookingSettings();
    }


    if (
      !isBookingDay(
        dateInput.value
      )
    ) {

      renderInitialSlots();

      return;
    }


    if (timeSelect) {

      timeSelect.innerHTML = `
        <option value="">
          Checking availability...
        </option>
      `;


      timeSelect.disabled = true;
    }


    try {

      const {
        data,
        error
      } =
        await window.mwvSupabase.rpc(
          "get_booked_slots",
          {
            requested_date:
              dateInput.value
          }
        );


      if (error) {

        console.error(
          "Availability error:",
          error
        );


        showError(
          "Unable to load availability. Please try again."
        );


        return;
      }


      bookedSlots =
        Array.isArray(data)
          ? data
          : [];


      renderTimeSlots();


    } catch (error) {

      console.error(
        "Availability error:",
        error
      );


      showError(
        "Something went wrong while checking availability."
      );
    }
  }


  /* =========================================================
     RENDER DYNAMIC TIME DROPDOWN
     ========================================================= */

  function renderTimeSlots() {

    if (
      !timeSelect ||
      !bookingSettings
    ) {

      renderInitialSlots();

      return;
    }


    timeSelect.innerHTML = "";


    selectedTime = null;

    timeInput.value = "";


    const duration =
      selectedDuration;


    const startMinutes =
      timeToMinutes(
        bookingSettings.booking_start_time
      );


    const endMinutes =
      timeToMinutes(
        bookingSettings.booking_end_time
      );


    const interval =
      Number(
        bookingSettings.slot_interval_minutes
      ) || 15;


    const placeholder =
      document.createElement(
        "option"
      );


    placeholder.value = "";

    placeholder.textContent =
      "Select an available time";

    placeholder.selected = true;

    placeholder.disabled = true;


    timeSelect.appendChild(
      placeholder
    );


    let availableCount = 0;


    for (
      let minutes = startMinutes;

      minutes + duration <=
        endMinutes;

      minutes += interval
    ) {

      const time =
        minutesToTime(
          minutes
        );


      const isBooked =
        bookedSlots.some(
          slot => {

            if (
              !slot.scheduled_at
            ) {

              return false;
            }


            const bookedDate =
              new Date(
                slot.scheduled_at
              );


            const bookedIST =
              new Intl.DateTimeFormat(
                "en-CA",
                {
                  timeZone:
                    getTimezone(),

                  year: "numeric",

                  month: "2-digit",

                  day: "2-digit",

                  hour: "2-digit",

                  minute: "2-digit",

                  hour12: false
                }
              ).formatToParts(
                bookedDate
              );


            const getPart =
              type =>
                bookedIST.find(
                  p =>
                    p.type === type
                )?.value;


            const bookedDateString =
              `${getPart("year")}-` +
              `${getPart("month")}-` +
              `${getPart("day")}`;


            const bookedTime =
              `${getPart("hour")}:` +
              `${getPart("minute")}`;


            if (
              bookedDateString !==
              dateInput.value
            ) {

              return false;
            }


            return overlaps(
              time,
              duration,
              bookedTime,
              Number(
                slot.duration_minutes ||
                15
              )
            );
          }
        );


      const option =
        document.createElement(
          "option"
        );


      option.value =
        time;


      if (isBooked) {

        option.disabled = true;


        option.textContent =
          `${formatTime(time)} — Booked`;

      } else {

        option.textContent =
          formatTime(time);


        availableCount++;
      }


      timeSelect.appendChild(
        option
      );
    }


    if (
      availableCount === 0
    ) {

      timeSelect.innerHTML = `
        <option value="">
          No available times for this date
        </option>
      `;


      timeSelect.disabled = true;

      return;
    }


    timeSelect.disabled = false;
  }


  /* =========================================================
     TIME SELECTION
     ========================================================= */

  if (timeSelect) {

    timeSelect.addEventListener(
      "change",
      function () {

        selectedTime =
          timeSelect.value ||
          null;


        timeInput.value =
          selectedTime || "";


        clearStatus();
      }
    );
  }


  /* =========================================================
     FORM SUBMISSION
     ========================================================= */

  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      clearStatus();


      if (!bookingSettings) {

        try {

          await loadBookingSettings();

        } catch (error) {

          showError(
            "Booking settings could not be loaded. Please try again."
          );


          return;
        }
      }


      if (!dateInput.value) {

        showError(
          "Please select a date."
        );


        return;
      }


      if (
        dateInput.value <
        getTodayInConfiguredTimezone()
      ) {

        showError(
          "Please select today or a future date."
        );


        return;
      }


      if (
        !isBookingDay(
          dateInput.value
        )
      ) {

        showError(
          getUnavailableDayMessage(
            dateInput.value
          )
        );


        return;
      }


      const durationAllowed =
        selectedDuration === 15
          ? !!bookingSettings.duration_15_enabled
          : !!bookingSettings.duration_30_enabled;


      if (!durationAllowed) {

        showError(
          `${selectedDuration}-minute bookings are currently unavailable.`
        );


        return;
      }


      if (!selectedTime) {

        showError(
          "Please select an available time."
        );


        if (timeSelect) {

          timeSelect.focus();
        }


        return;
      }


      if (
        !nameInput.value.trim()
      ) {

        showError(
          "Please enter your full name."
        );


        nameInput.focus();


        return;
      }


      if (
        !phoneInput.value.trim()
      ) {

        showError(
          "Please enter your phone number."
        );


        phoneInput.focus();


        return;
      }


      if (
        !emailInput.value.trim()
      ) {

        showError(
          "Please enter your email address."
        );


        emailInput.focus();


        return;
      }


      if (
        !consentInput.checked
      ) {

        showError(
          "Please agree to the booking consent before continuing."
        );


        consentInput.focus();


        return;
      }


      if (!window.mwvSupabase) {

        showError(
          "Booking system is not connected. Please try again."
        );


        return;
      }


      submitButton.disabled =
        true;


      submitButton.textContent =
        "Submitting Booking...";


      try {

        const {
          data,
          error
        } =
          await window.mwvSupabase.rpc(
            "create_booking",
            {
              p_name:
                nameInput.value.trim(),

              p_phone:
                phoneInput.value.trim(),

              p_email:
                emailInput.value.trim(),

              p_duration_minutes:
                selectedDuration,

              p_preferred_date:
                dateInput.value,

              p_preferred_time:
                selectedTime,

              p_notes:
                notesInput.value.trim() ||
                null,

              p_consent:
                true
            }
          );


        if (error) {

          console.error(
            "Booking RPC error:",
            error
          );


          const errorMessage =
            error.message ||
            "Unable to submit your booking. Please try again.";


          if (
            errorMessage
              .toLowerCase()
              .includes("time slot") ||

            errorMessage
              .toLowerCase()
              .includes("overlap") ||

            errorMessage
              .toLowerCase()
              .includes("booked")
          ) {

            showError(
              "That time was just booked by someone else. Please choose another available time."
            );


            await loadAvailability();

          } else {

            showError(
              errorMessage
            );
          }


          return;
        }


        const booking =
          Array.isArray(data)
            ? data[0]
            : data;


        if (
          !booking ||
          !booking.booking_reference
        ) {

          console.error(
            "Booking created but no booking reference was returned:",
            data
          );


          showError(
            "Booking was created, but the confirmation reference could not be retrieved. Please contact us."
          );


          return;
        }


        showBookingSuccess(
          booking.booking_reference
        );


      } catch (error) {

        console.error(
          "Unexpected booking error:",
          error
        );


        showError(
          "Something went wrong while submitting your booking. Please try again."
        );


      } finally {

        submitButton.disabled =
          false;


        submitButton.textContent =
          "Confirm Booking →";
      }
    }
  );


  /* =========================================================
     SUCCESS SCREEN
     ========================================================= */

  function showBookingSuccess(
    reference
  ) {

    form.hidden = true;

    successBox.hidden = false;

    referenceBox.textContent =
      reference;
  }


  /* =========================================================
     STATUS
     ========================================================= */

  function showError(
    message
  ) {

    statusBox.textContent =
      message;

    statusBox.className =
      "booking-status error";
  }


  function clearStatus() {

    statusBox.textContent =
      "";

    statusBox.className =
      "booking-status";
  }


  /* =========================================================
     PRELOAD SETTINGS
     ========================================================= */

  loadBookingSettings()
    .catch(error => {

      console.warn(
        "MoneyWithVikas booking settings preload failed:",
        error
      );
    });

})();