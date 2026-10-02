import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

// Obfuscated parts — not a single plaintext mailto in the source HTML.
const EMAIL_USER = ["mobidik", "460"].join("");
const EMAIL_HOST = ["gmail", "com"].join(".");

const SupportSection = () => {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);

  const email = useMemo(() => `${EMAIL_USER}@${EMAIL_HOST}`, []);
  const mailto = useMemo(
    () =>
      `mailto:${email}?subject=${encodeURIComponent(
        t("support.mailSubject")
      )}`,
    [email, t]
  );

  return (
    <section className="siteSection supportSection" aria-labelledby="support-title">
      <div className="supportSection__card">
        <div className="siteSection__head siteSection__head--left">
          <h2 id="support-title" className="siteSection__title">
            {t("support.title")}
          </h2>
          <p className="siteSection__text">{t("support.subtitle")}</p>
        </div>

        <div className="supportSection__actions">
          {!revealed ? (
            <button
              type="button"
              className="supportSection__btn"
              onClick={() => setRevealed(true)}
            >
              {t("support.reveal")}
            </button>
          ) : (
            <a className="supportSection__btn supportSection__btn--link" href={mailto}>
              {email}
            </a>
          )}
          <p className="supportSection__hint">{t("support.hint")}</p>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
