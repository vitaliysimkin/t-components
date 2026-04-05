import type { ModalPosition, Position } from './types'

/**
 * Розраховує координати позиції модального вікна
 * @param position - позиція (об'єкт з координатами або строковий пресет)
 * @param containerWidth - ширина контейнера
 * @param containerHeight - висота контейнера
 * @param windowWidth - ширина вікна браузера
 * @param windowHeight - висота вікна браузера
 * @returns об'єкт з координатами {x, y}
 */
export function calculateModalPosition(
  position: ModalPosition = "top-left",
  containerWidth: number = 0,
  containerHeight: number = 0,
  windowWidth: number = window.innerWidth,
  windowHeight: number = window.innerHeight
): Position {
  const offset = 10; // відступ від краю
  
  if (typeof position === 'string') {
    switch (position) {
      case "top-left":
        return { x: offset, y: offset };
      case "top-right":
        return { x: windowWidth - containerWidth - offset, y: offset };
      case "bottom-left":
        return { x: offset, y: windowHeight - containerHeight - offset };
      case "bottom-right":
        return { x: windowWidth - containerWidth - offset, y: windowHeight - containerHeight - offset };
      case "center":
        return {
          x: (windowWidth - containerWidth) / 2,
          y: (windowHeight - containerHeight) / 2
        };
      default:
        return { x: offset, y: offset };
    }
  }
  
  // Якщо position - це об'єкт з координатами
  return {
    x: position.x || 0,
    y: position.y || 0
  };
}


