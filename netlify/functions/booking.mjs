const ALLOWED_ORIGIN =
  "https://moneywithvikas.netlify.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
};


function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: corsHeaders
  });
}


function clean(value, maxLength = 1000) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .slice(0, maxLength);
}


function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}


function isValidTime(value) {
  return /^\d{2}:\d{2}$/.test(value);
}


function isValidDuration(value) {
  return value === 15 || value === 30;
}


export default async function handler(request) {

  /* =========================================================
     CORS PREFLIGHT
     ========================================================= */

  if (request.method === "OPTIONS") {

    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }


  /* =========================================================
     METHOD CHECK
     ========================================================= */

  if (request.method !== "POST") {

    return jsonResponse(
      {
        success: false,
        error: "Method not allowed."
      },
      405
    );
  }


  try {

    /* =======================================================
       SERVER ENVIRONMENT
       ======================================================= */

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;


    if (
      !supabaseUrl ||
      !supabaseSecretKey
    ) {

      console.error(
        "Missing Supabase server environment variables."
      );

      return jsonResponse(
        {
          success: false,
          error: "Server configuration error."
        },
        500
      );
    }


    /* =======================================================
       PARSE REQUEST
       ======================================================= */

    let body;

    try {

      body =
        await request.json();

    } catch {

      return jsonResponse(
        {
          success: false,
          error: "Invalid booking data."
        },
        400
      );
    }


    /* =======================================================
       CLEAN INPUT
       ======================================================= */

    const name =
      clean(
        body.name,
        100
      );

    const phone =
      clean(
        body.phone,
        30
      );

    const email =
      clean(
        body.email,
        150
      ).toLowerCase();

    const meetingType =
      clean(
        body.meeting_type,
        50
      );

    const durationMinutes =
      Number(
        body.duration_minutes
      );

    const preferredDate =
      clean(
        body.preferred_date,
        10
      );

    const preferredTime =
      clean(
        body.preferred_time,
        5
      );

    const notes =
      clean(
        body.notes,
        2000
      );

    const consent =
      body.consent === true;


    /* =======================================================
       VALIDATION
       ======================================================= */

    if (
      !name ||
      !phone ||
      !email ||
      !meetingType ||
      !preferredDate ||
      !preferredTime
    ) {

      return jsonResponse(
        {
          success: false,
          error:
            "Please complete all required booking fields."
        },
        400
      );
    }


    if (!isValidEmail(email)) {

      return jsonResponse(
        {
          success: false,
          error:
            "Please enter a valid email address."
        },
        400
      );
    }


    if (!isValidDuration(durationMinutes)) {

      return jsonResponse(
        {
          success: false,
          error:
            "Invalid meeting duration."
        },
        400
      );
    }


    if (!isValidDate(preferredDate)) {

      return jsonResponse(
        {
          success: false,
          error:
            "Invalid booking date."
        },
        400
      );
    }


    if (!isValidTime(preferredTime)) {

      return jsonResponse(
        {
          success: false,
          error:
            "Invalid booking time."
        },
        400
      );
    }


    if (!consent) {

      return jsonResponse(
        {
          success: false,
          error:
            "Booking consent is required."
        },
        400
      );
    }


    /* =======================================================
       CALL SECURE SUPABASE RPC
       
       IMPORTANT:
       create_booking() has exactly 8 parameters:
       
       p_name
       p_phone
       p_email
       p_duration_minutes
       p_preferred_date
       p_preferred_time
       p_notes
       p_consent
       ======================================================= */

    const rpcResponse =
      await fetch(
        `${supabaseUrl}/rest/v1/rpc/create_booking`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "apikey":
              supabaseSecretKey,

            "Authorization":
              `Bearer ${supabaseSecretKey}`
          },

          body:
            JSON.stringify({

              p_name:
                name,

              p_phone:
                phone,

              p_email:
                email,

              p_duration_minutes:
                durationMinutes,

              p_preferred_date:
                preferredDate,

              p_preferred_time:
                preferredTime,

              p_notes:
                notes || null,

              p_consent:
                consent
            })
        }
      );


    /* =======================================================
       SUPABASE ERROR
       ======================================================= */

    if (!rpcResponse.ok) {

      const errorText =
        await rpcResponse.text();

      console.error(
        "Supabase booking RPC failed:",
        rpcResponse.status,
        errorText
      );


      const lowerError =
        errorText.toLowerCase();


      /* -----------------------------------------------------
         BOOKING CONFLICT
         ----------------------------------------------------- */

      if (
        lowerError.includes(
          "overlap"
        ) ||
        lowerError.includes(
          "exclusion"
        ) ||
        lowerError.includes(
          "already booked"
        ) ||
        lowerError.includes(
          "duplicate"
        ) ||
        lowerError.includes(
          "time slot"
        )
      ) {

        return jsonResponse(
          {
            success: false,
            error:
              "That time has just been booked. Please choose another available time."
          },
          409
        );
      }


      /* -----------------------------------------------------
         VALIDATION ERROR
         ----------------------------------------------------- */

      if (
        rpcResponse.status === 400 ||
        lowerError.includes(
          "invalid"
        ) ||
        lowerError.includes(
          "not available"
        )
      ) {

        return jsonResponse(
          {
            success: false,
            error:
              "That booking time is not available. Please choose another time."
          },
          400
        );
      }


      /* -----------------------------------------------------
         GENERIC SERVER ERROR
         ----------------------------------------------------- */

      return jsonResponse(
        {
          success: false,
          error:
            "Unable to submit your booking right now."
        },
        500
      );
    }


    /* =======================================================
       READ RPC RESULT
       ======================================================= */

    let result;

    try {

      result =
        await rpcResponse.json();

    } catch {

      return jsonResponse(
        {
          success: false,
          error:
            "Invalid response from booking service."
        },
        500
      );
    }


    /* =======================================================
       NORMALIZE RPC RESULT
       ======================================================= */

    const booking =
      Array.isArray(result)
        ? result[0]
        : result;


    const bookingId =
      booking?.booking_id ||
      null;


    const bookingReference =
      booking?.booking_reference ||
      null;


    const bookingStatus =
      booking?.booking_status ||
      null;


    /* =======================================================
       VERIFY BOOKING RESULT
       ======================================================= */

    if (
      !bookingId ||
      !bookingReference
    ) {

      console.error(
        "Booking created but required confirmation data was not returned:",
        result
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Booking was created, but the confirmation reference could not be retrieved."
        },
        500
      );
    }


    /* =======================================================
       SUCCESS
       ======================================================= */

    return jsonResponse(
      {
        success: true,

        message:
          "Booking request submitted successfully.",

        booking_id:
          bookingId,

        booking_reference:
          bookingReference,

        booking_status:
          bookingStatus
      },
      200
    );


  } catch (error) {

    console.error(
      "MoneyWithVikas booking function error:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          "Something went wrong while submitting your booking."
      },
      500
    );
  }
}