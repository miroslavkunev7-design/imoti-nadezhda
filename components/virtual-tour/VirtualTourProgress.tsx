'use client'

import { PIPELINE_STEPS, type PipelineStepId } from '@/types/virtual-tour'

interface Props {
  currentStep: PipelineStepId
  percent: number
  label: string
}

export default function VirtualTourProgress({ currentStep, percent, label }: Props) {
  const activeIdx = PIPELINE_STEPS.findIndex(s => s.id === currentStep)

  return (
    <div className="vt-progress" role="status" aria-live="polite">
      <div className="vt-progress__head">
        <span className="vt-progress__label">{label || 'Подготовка...'}</span>
        <span className="vt-progress__pct">{Math.round(percent)}%</span>
      </div>
      <div className="vt-progress__bar">
        <div className="vt-progress__fill" style={{ width: `${percent}%` }} />
      </div>
      <ol className="vt-progress__steps">
        {PIPELINE_STEPS.map((step, i) => {
          const done = activeIdx > i || currentStep === 'done'
          const active = step.id === currentStep
          return (
            <li
              key={step.id}
              className={`vt-progress__step ${done ? 'is-done' : ''} ${active ? 'is-active' : ''}`}
            >
              <span className="vt-progress__dot" />
              <span className="vt-progress__step-label">{step.label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
