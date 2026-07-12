import { profiles } from '../data/pricing.js'

export function ProfilePicker({ value, onChange }) {
  return (
    <div className="profile-grid">
      {Object.entries(profiles).map(([key, profile]) => (
        <button
          key={key}
          type="button"
          className={value === key ? 'selected' : ''}
          onClick={() => onChange(key)}
        >
          <b>{profile.label}</b>
          <span>{profile.note}</span>
        </button>
      ))}
    </div>
  )
}
