/** ~5–6 km — enough to treat same city from different geocoders as one place */
const LOCATION_EPS = 0.05;

export const isSameLocation = (a, b, eps = LOCATION_EPS) => {
  if (
    !a ||
    !b ||
    a.lat == null ||
    a.lng == null ||
    b.lat == null ||
    b.lng == null
  ) {
    return false;
  }

  return (
    Math.abs(Number(a.lat) - Number(b.lat)) < eps &&
    Math.abs(Number(a.lng) - Number(b.lng)) < eps
  );
};

export const hasDuplicateLocation = (params, lat, lng) =>
  (params || []).some((item) => isSameLocation(item, { lat, lng }));
