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

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
};

function response(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body)
  };
}

function clean(value, maxLength = 1000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(event) {
  // Handle browser CORS preflight.
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers
    };
  }

  // Only POST is allowed.
  if (event.httpMethod !== "POST") {
    return response(405, {
      success: false,
      error: "Method not allowed."
    });
  }

  try {
    // Read server-side environment variables.
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    // Make sure the server is configured.
    if (!supabaseUrl || !supabaseSecretKey) {
      console.error("Missing Supabase server environment variables.");

      return response(500, {
        success: false,
        error: "Server configuration error."
      });
    }

    // Parse request body.
    let body;

    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return response(400, {
        success: false,
        error: "Invalid request data."
      });
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
      return response(400, {
        success: false,
        error: "Please complete all required fields."
      });
    }

    // Validate email.
    if (!isValidEmail(email)) {
      return response(400, {
        success: false,
        error: "Please enter a valid email address."
      });
    }

    // Consent is mandatory.
    if (!consent) {
      return response(400, {
        success: false,
        error: "Consent is required to submit this request."
      });
    }

    // Insert using the Supabase server secret key.
    //
    // IMPORTANT:
    // SUPABASE_SECRET_KEY exists only on Netlify's server.
    // It is never sent to the browser.
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

    // Handle Supabase failure.
    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();

      console.error(
        "Supabase contact request insert failed:",
        insertResponse.status,
        errorText
      );

      return response(500, {
        success: false,
        error: "Unable to submit your request right now."
      });
    }

    // Read inserted record.
    const insertedRows = await insertResponse.json();

    const requestId =
      Array.isArray(insertedRows) && insertedRows[0]
        ? insertedRows[0].id
        : null;

    // Success response.
    return response(200, {
      success: true,
      message: "Request submitted successfully.",
      request_id: requestId
    });

  } catch (error) {
    console.error("submit-request function error:", error);

    return response(500, {
      success: false,
      error: "Something went wrong. Please try again."
    });
  }
}