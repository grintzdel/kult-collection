"use client"

type QuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max = 9999,
  disabled = false,
}: QuantityStepperProps) => {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.floor(n)))

  return (
    <div className="flex h-10 w-fit items-center rounded-md border border-neutral-200">
      <button
        type="button"
        aria-label="Diminuer la quantité"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className="flex h-full w-10 items-center justify-center text-lg text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label="Quantité"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          const n = e.target.valueAsNumber
          if (!Number.isNaN(n)) {
            onChange(clamp(n))
          }
        }}
        onBlur={(e) => {
          const n = e.target.valueAsNumber
          onChange(Number.isNaN(n) ? min : clamp(n))
        }}
        className="h-full w-14 border-x border-neutral-200 bg-transparent text-center outline-none [appearance:textfield] focus:border-neutral-900 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Augmenter la quantité"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className="flex h-full w-10 items-center justify-center text-lg text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40"
      >
        +
      </button>
    </div>
  )
}

export default QuantityStepper
