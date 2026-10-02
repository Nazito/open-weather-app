import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SupportModal from "./SupportModal";

const SupportSection = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="siteSection supportSection" aria-labelledby="support-title">
        <div className="supportSection__card">
          <div className="siteSection__head siteSection__head--left">
            <h2 id="support-title" className="siteSection__title">
              {t("support.title")}
            </h2>
            <p className="siteSection__text">{t("support.subtitle")}</p>
          </div>

          <div className="supportSection__actions">
            <button
              type="button"
              className="supportSection__btn"
              onClick={() => setOpen(true)}
            >
              {t("support.contactBtn")}
            </button>
          </div>
        </div>
      </section>

      {open && <SupportModal onClose={() => setOpen(false)} />}
    </>
  );
};

export default SupportSection;
