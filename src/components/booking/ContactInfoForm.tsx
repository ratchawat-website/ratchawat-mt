"use client";

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  numParticipants: number;
  notes: string;
}

interface Props {
  value: ContactInfo;
  onChange: (value: ContactInfo) => void;
  showParticipants?: boolean;
  maxParticipants?: number;
}

export default function ContactInfoForm({
  value,
  onChange,
  showParticipants = false,
  maxParticipants = 3,
}: Props) {
  const update = (patch: Partial<ContactInfo>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Full name"
        value={value.name}
        onChange={(e) => update({ name: e.target.value })}
        className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
        required
      />
      <input
        type="email"
        placeholder="Email address"
        value={value.email}
        onChange={(e) => update({ email: e.target.value })}
        className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
        required
      />
      <input
        type="tel"
        placeholder="Phone (e.g. +66 12 345 6789)"
        value={value.phone}
        onChange={(e) => update({ phone: e.target.value })}
        className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
        required
      />
      <input
        type="text"
        placeholder="Nationality (optional)"
        value={value.nationality}
        onChange={(e) => update({ nationality: e.target.value })}
        className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
      />
      {showParticipants && (
        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-2">
            Number of participants
          </label>
          <select
            value={value.numParticipants}
            onChange={(e) =>
              update({ numParticipants: parseInt(e.target.value, 10) })
            }
            className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface focus:border-primary focus:outline-none transition-colors"
          >
            {Array.from({ length: maxParticipants }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "person" : "people"}
                </option>
              ),
            )}
          </select>
        </div>
      )}
      <textarea
        placeholder="Notes (optional) - injuries, experience level, anything else..."
        value={value.notes}
        onChange={(e) => update({ notes: e.target.value })}
        rows={3}
        className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors resize-none"
      />
    </div>
  );
}

export function isContactInfoValid(info: ContactInfo): boolean {
  return (
    info.name.trim().length >= 2 &&
    /^\S+@\S+\.\S+$/.test(info.email.trim()) &&
    info.phone.trim().length >= 6
  );
}
