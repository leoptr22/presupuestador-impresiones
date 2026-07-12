export function SegmentedControl({ label, value, options, onChange }) {
  return (
    <div className="segmented-field">
      {label && <span>{label}</span>}
      <div className="segmented-control">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            className={value === option.value ? 'active' : ''}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
