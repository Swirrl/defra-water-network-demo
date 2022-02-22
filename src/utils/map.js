export function getMapBoundingBox(map) {
  const {_sw, _ne} = map.getBounds();
  return [_sw.lng, _sw.lat, _ne.lng, _ne.lat];
}
