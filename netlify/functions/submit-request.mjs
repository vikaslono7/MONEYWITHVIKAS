/**
 * MoneyWithVikas
 * Netlify Function: submit-request
 *
 * Purpose:
 * Secure server-side submission of public contact requests.
 *
 * Endpoint:
 * POST /.netlify/functions/submit-request
 *
 * Required Netlify environment variables:
 * SUPABASE_URL
 * SUPABASE_SECRET_KEY
 */

const ALLOWED_ORIGIN = "https://moneywithvikas.netlify.app";

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
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(request) {
  // Handle CORS preflight.
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Only POST is allowed.
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
    // Read server-side environment variables.
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    // Verify server configuration.
    if (!supabaseUrl || !supabaseSecretKey) {
      console.error("Missing Supabase server environment variables.");

      return jsonResponse(
        {
          success: false,
          error: "Server configuration error."
        },
        500
      );
    }

    // Parse JSON request body.
    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          error: "Invalid request data."
        },
        400
      );
    }

    // Read and sanitize fields.
    const name = clean(body.name, 100);
    const phone = clean(body.phone, 30);
    const email = clean(body.email, 150).toLowerCase();
    const purpose = clean(body.purpose, 100);
    const profession = clean(body.profession, 100);
    const location = clean(body.location, 150);
    const message = clean(body.message, 2000);
    const consent = body.consent === true;

    // Validate required fields.
    if (
      !name ||
      !phone ||
      !email ||
      !purpose ||
      !profession ||
      !location ||
      !message
    ) {
      return jsonResponse(
        {
          success: false,
          error: "Please complete all required fields."
        },
        400
      );
    }

    // Validate email.
    if (!isValidEmail(email)) {
      return jsonResponse(
        {
          success: false,
          error: "Please enter a valid email address."
        },
        400
      );
    }

    // Consent is mandatory.
    if (!consent) {
      return jsonResponse(
        {
          success: false,
          error: "Consent is required to submit this request."
        },
        400
      );
    }

    // Insert into Supabase using the server-only secret key.
    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/contact_requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseSecretKey,
          "Authorization": `Bearer ${supabaseSecretKey}`,
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          purpose,
          profession,
          location,
          message,
          consent,
          status: "new"
        })
      }
    );

    // Handle Supabase errors.
    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();

      console.error(
        "Supabase contact request insert failed:",
        insertResponse.status,
        errorText
      );

      return jsonResponse(
        {
          success: false,
          error: "Unable to submit your request right now."
        },
        500
      );
    }

    // Read the inserted record.
    const insertedRows = await insertResponse.json();

    const requestId =
      Array.isArray(insertedRows) && insertedRows[0]
        ? insertedRows[0].id
        : null;

    // Successful submission.
    return jsonResponse({
      success: true,
      message: "Request submitted successfully.",
      request_id: requestId
    });

  } catch (error) {
    console.error("submit-request function error:", error);

    return jsonResponse(
      {
        success: false,
        error: "Something went wrong. Please try again."
      },
      500
    );
  }
}