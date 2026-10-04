// ------------------ Game <-> Map Conversion ------------------
export const mapCenter: [number, number] = [-119.43, 58.84]
export const latPr100 = 1.421

/** Convert game world coordinates -> Leaflet map coordinates */
export function gameToMap(x: number, y: number): [number, number] {
  return [
    mapCenter[0] + (latPr100 / 100) * y, // lng
    mapCenter[1] + (latPr100 / 100) * x, // lat
  ]
}

/** Convert Leaflet map coordinates -> game world coordinates */
export function mapToGame(lat: number, lng: number): [number, number] {
  return [
    ((lng - mapCenter[1]) * 100) / latPr100,
    ((lat - mapCenter[0]) * 100) / latPr100,
  ]
}
