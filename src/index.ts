const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === "POST") {
      if (path === "/FORM_CONTACT") {
        return await handleFormContact(request, env.FORM_CONTACT);
      } else {
        // Główna ścieżka domyślna (np. /)
        return await handleFormSubmission(request, env.FORM_SUBMISSIONS);
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};

// Domyślny formularz: imie, nazwisko, email, firma
async function handleFormSubmission(request, kv) {
  try {
    const body = await request.json();
    const { imie, nazwisko, email, firma } = body;

    if (!imie || !nazwisko || !email) {
      return new Response("Brakuje wymaganych danych.", {
        status: 400,
        headers: corsHeaders
      });
    }

    const timestamp = new Date().toISOString();
    const key = `submission:${timestamp}`;
    const value = JSON.stringify({ imie, nazwisko, email, firma, timestamp });

    await kv.put(key, value);

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch {
    return new Response("Błąd przetwarzania danych", {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Formularz kontaktowy: imie_nazwisko, email, telefon?, firma?, wiadomosc
async function handleFormContact(request, kv) {
  try {
    const body = await request.json();
    const { imie_nazwisko, email, telefon, firma, wiadomosc } = body;

    if (!imie_nazwisko || !email || !wiadomosc) {
      return new Response("Brakuje wymaganych danych.", {
        status: 400,
        headers: corsHeaders
      });
    }

    // Walidacja długości pól
    const maxLen = 5000;
    const tooLong = Object.entries({ imie_nazwisko, email, telefon, firma, wiadomosc })
      .filter(([_, val]) => typeof val === "string" && val.length > maxLen);

    if (tooLong.length > 0) {
      const fields = tooLong.map(([k]) => k).join(", ");
      return new Response(`Pola przekraczają dozwoloną długość (${maxLen} znaków): ${fields}`, {
        status: 400,
        headers: corsHeaders
      });
    }

    const timestamp = new Date().toISOString();
    const key = `contact:${timestamp}`;
    const value = JSON.stringify({
      imie_nazwisko,
      email,
      telefon,
      firma,
      wiadomosc,
      timestamp
    });

    await kv.put(key, value);

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response("Błąd przetwarzania danych", {
      status: 500,
      headers: corsHeaders
    });
  }
}
