import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const SupportModal = ({ onClose }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && status !== "sending") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, status]);

  const mapApiError = (code) => {
    switch (code) {
      case "message_too_short":
        return t("support.messageTooShort");
      case "message_too_long":
        return t("support.messageTooLong");
      case "not_configured":
        return t("support.notConfigured");
      default:
        return t("support.sendFailed");
    }
  };

  const handleSend = async () => {
    const body = message.trim();
    if (!body) {
      setError(t("support.emptyMessage"));
      return;
    }
    if (body.length < 10) {
      setError(t("support.messageTooShort"));
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: body,
          subject: t("support.mailSubject"),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        setError(mapApiError(data.error));
        setStatus("idle");
        return;
      }

      setStatus("success");
    } catch (sendError) {
      setError(t("support.sendFailed"));
      setStatus("idle");
    }
  };

  return (
    <div className="forecastModal supportModal" role="presentation" onClick={onClose}>
      <div
        className="forecastModal__panel supportModal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="forecastModal__close"
          onClick={onClose}
          aria-label={t("support.close")}
          disabled={status === "sending"}
        >
          <span aria-hidden="true" />
        </button>

        {status === "success" ? (
          <div className="supportModal__success">
            <h2 id="support-modal-title" className="forecastModal__city">
              {t("support.successTitle")}
            </h2>
            <p className="siteSection__text">{t("support.successText")}</p>
            <button type="button" className="supportModal__send" onClick={onClose}>
              {t("support.done")}
            </button>
          </div>
        ) : (
          <>
            <header className="supportModal__header">
              <h2 id="support-modal-title" className="forecastModal__city">
                {t("support.modalTitle")}
              </h2>
              <p className="siteSection__text">{t("support.modalText")}</p>
            </header>

            <label className="supportModal__field">
              <span className="supportModal__label">{t("support.messageLabel")}</span>
              <textarea
                className="supportModal__textarea"
                rows={6}
                value={message}
                disabled={status === "sending"}
                onChange={(event) => {
                  setMessage(event.target.value);
                  if (error) setError("");
                }}
                placeholder={t("support.messagePlaceholder")}
              />
            </label>

            {error ? <p className="supportModal__error">{error}</p> : null}

            <p className="supportModal__hint">{t("support.sendHint")}</p>

            <div className="supportModal__actions">
              <button
                type="button"
                className="supportModal__send"
                onClick={handleSend}
                disabled={status === "sending"}
              >
                {status === "sending" ? t("support.sending") : t("support.send")}
              </button>
              <button
                type="button"
                className="supportModal__cancel"
                onClick={onClose}
                disabled={status === "sending"}
              >
                {t("support.cancel")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupportModal;
