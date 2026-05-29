'use client'

import type { TourNavigationEdge, TourNode } from '@/types/virtual-tour'

interface Props {
  currentNode: TourNode
  nodes: TourNode[]
  edges: TourNavigationEdge[]
  stepIndex: number
  onGoToNode: (nodeId: string) => void
  onNextStep: () => void
  hasNextStep: boolean
}

function angleBetween(from: TourNode, to: TourNode): number {
  const dx = to.position.x - from.position.x
  const dz = to.position.z - from.position.z
  return Math.atan2(dx, -dz)
}

export default function TourFloorNav({
  currentNode,
  nodes,
  edges,
  stepIndex,
  onGoToNode,
  onNextStep,
  hasNextStep,
}: Props) {
  const outgoing = edges.filter(e => e.from === currentNode.id)

  return (
    <div className="vt-floor-nav" aria-label="Навигация по пода">
      {hasNextStep && (
        <button
          type="button"
          className="vt-floor-arrow vt-floor-arrow--forward"
          onClick={onNextStep}
          aria-label="Следваща стъпка в стаята"
        >
          <span className="vt-floor-arrow__chev" />
          <span className="vt-floor-arrow__label">Напред</span>
        </button>
      )}

      {outgoing.map(edge => {
        const target = nodes.find(n => n.id === edge.to)
        if (!target) return null
        const rad = angleBetween(currentNode, target)
        const deg = (rad * 180) / Math.PI
        const left = 50 + Math.sin(rad) * 28
        const isDoor = edge.transition === 'door'

        return (
          <button
            key={edge.to}
            type="button"
            className={`vt-floor-arrow ${isDoor ? 'vt-floor-arrow--door' : ''}`}
            style={{
              left: `${left}%`,
              bottom: '14%',
              transform: `translateX(-50%) rotate(${deg}deg)`,
            }}
            onClick={() => onGoToNode(target.id)}
            aria-label={edge.label}
          >
            <span className="vt-floor-arrow__chev" />
            <span
              className="vt-floor-arrow__label"
              style={{ transform: `rotate(${-deg}deg)` }}
            >
              {isDoor ? 'Вход' : target.label}
            </span>
          </button>
        )
      })}

      {stepIndex > 0 && (
        <span className="vt-floor-nav__step-badge">Стъпка {stepIndex + 1}</span>
      )}
    </div>
  )
}
