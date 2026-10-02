const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const handleSupport = async (request, env) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  const accessKey = env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return json({ ok: false, error: "not_configured" }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const message = String(payload.message || "").trim();
  if (message.length < 10) {
    return json({ ok: false, error: "message_too_short" }, 400);
  }
  if (message.length > 5000) {
    return json({ ok: false, error: "message_too_long" }, 400);
  }

  const subject =
    typeof payload.subject === "string" && payload.subject.trim()
      ? payload.subject.trim().slice(0, 120)
      : "Open Weather support";

  try {
    const upstream = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject,
        message,
        from_name: "Open Weather",
      }),
    });

    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok || !result.success) {
      return json({ ok: false, error: "send_failed" }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: "send_failed" }, 502);
  }
};

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/support") {
      return handleSupport(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
