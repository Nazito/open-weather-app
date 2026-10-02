import React from "react";
import { useTranslation } from "react-i18next";

const REVIEW_IDS = ["anna", "oleh", "maria"];

const ReviewsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="siteSection reviewsSection" aria-labelledby="reviews-title">
      <div className="siteSection__head">
        <h2 id="reviews-title" className="siteSection__title">
          {t("reviews.title")}
        </h2>
        <p className="siteSection__text">{t("reviews.subtitle")}</p>
      </div>

      <ul className="reviewsSection__list">
        {REVIEW_IDS.map((id) => (
          <li key={id} className="reviewsSection__card">
            <div className="reviewsSection__stars" aria-label={t("reviews.ratingLabel")}>
              {"★★★★★"}
            </div>
            <p className="reviewsSection__quote">{t(`reviews.items.${id}.text`)}</p>
            <div className="reviewsSection__author">
              <span className="reviewsSection__avatar" aria-hidden="true">
                {t(`reviews.items.${id}.name`).charAt(0)}
              </span>
              <div>
                <strong className="reviewsSection__name">
                  {t(`reviews.items.${id}.name`)}
                </strong>
                <span className="reviewsSection__role">
                  {t(`reviews.items.${id}.role`)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ReviewsSection;
