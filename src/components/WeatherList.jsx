import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import WeatherCardItem from "./WeatherCardItem";
import ForecastModal from "./ForecastModal";

const SortableWeatherCard = ({
  item,
  order,
  removeWeatherCard,
  getUnitsThunk,
  onOpenForecast,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(item.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`weatherGrid__item${
        isDragging ? " weatherGrid__item--dragging" : ""
      }`}
    >
      <WeatherCardItem
        order={order}
        dataCard={item}
        removeWeatherCard={removeWeatherCard}
        getUnitsThunk={getUnitsThunk}
        dragHandleProps={{ ...attributes, ...listeners }}
        onOpenForecast={onOpenForecast}
      />
    </div>
  );
};

const WeatherList = (props) => {
  const { t } = useTranslation();
  const [openCardId, setOpenCardId] = useState(null);

  const itemIds = useMemo(
    () => props.weatherList.map((item) => String(item.id)),
    [props.weatherList]
  );

  const openCard = useMemo(
    () => props.weatherList.find((item) => item.id === openCardId) || null,
    [props.weatherList, openCardId]
  );

  const handleOpenForecast = useCallback((cardId) => {
    setOpenCardId(cardId);
  }, []);

  const handleCloseForecast = useCallback(() => {
    setOpenCardId(null);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (props.weatherList.length === 0) {
    return (
      <div className="emptyState">
        <span className="emptyState__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
            <path
              d="M7.5 16.5h9.2a3.7 3.7 0 0 0 .3-7.4 5.2 5.2 0 0 0-10.1-1.2A3.8 3.8 0 0 0 7.5 16.5Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2 className="emptyState__title">{t("emptyList")}</h2>
        <p className="emptyState__text">{t("emptyListHint")}</p>
      </div>
    );
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !props.reorderWeatherCards) return;

    const fromIndex = props.weatherList.findIndex(
      (item) => String(item.id) === String(active.id)
    );
    const toIndex = props.weatherList.findIndex(
      (item) => String(item.id) === String(over.id)
    );

    if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
      props.reorderWeatherCards(fromIndex, toIndex);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          <div className="weatherGrid">
            {props.weatherList.map((item, index) => (
              <SortableWeatherCard
                key={item.id}
                item={item}
                order={index}
                removeWeatherCard={props.removeWeatherCard}
                getUnitsThunk={props.getUnitsThunk}
                onOpenForecast={handleOpenForecast}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {openCard && (
        <ForecastModal card={openCard} onClose={handleCloseForecast} />
      )}
    </>
  );
};

export default WeatherList;
