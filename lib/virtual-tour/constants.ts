import type { SceneType } from '@/types/virtual-tour'
import { SCENE_ROUTE_ORDER } from '@/lib/virtual-tour/scene-route'

export { SCENE_ROUTE_ORDER }

export const SCENE_LABELS_BG: Record<SceneType, string> = {
  exterior_front: 'Фасада',
  exterior_side: 'Фасада — страничен изглед',
  exterior: 'Фасада / двор',
  yard: 'Двор',
  entrance: 'Вход',
  corridor: 'Коридор',
  hallway: 'Антре',
  staircase: 'Стълбище',
  living_room: 'Дневна',
  dining_area: 'Трапезария',
  kitchen: 'Кухня',
  bedroom: 'Спалня',
  bathroom: 'Баня',
  terrace: 'Тераса',
  balcony: 'Балкон',
  exit_point: 'Изход',
  exit: 'Изход',
  unknown: 'Помещение',
}

export const MIN_FRAMES_3D = 2
export const MIN_FRAMES_SLIDESHOW = 2
export const DEFAULT_FRAME_MS = 3200
export const MAX_FRAMES = 50

export const CDN_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
}
