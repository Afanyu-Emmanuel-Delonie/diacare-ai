import { useState } from 'react';
import { MdNotifications, MdPalette, MdLanguage, MdSecurity, MdCheck } from 'react-icons/md';
import useToast from '../../hooks/useToast.js';

const STORAGE_KEY = 'user_settings';

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">
          <Icon size={18} className="text-[#2563EB]" />
        </div>
        <h2 className="text-sm font-bold text-[#0F172A]">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[#0F172A]">{label}</p>
        {description && <p className="mt-0.5 text-xs text-[#64748B]">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 ${
          checked ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm font-medium text-[#0F172A]">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
      >
        {options.map(({ value: v, label: l }) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </div>
  );
}

function SettingsPage() {
  const { showToast } = useToast();
  const saved = loadSettings();

  const [settings, setSettings] = useState({
    emailNotifications: saved.emailNotifications ?? true,
    appointmentReminders: saved.appointmentReminders ?? true,
    medicationReminders: saved.medicationReminders ?? true,
    riskAlerts: saved.riskAlerts ?? true,
    compactView: saved.compactView ?? false,
    language: saved.language ?? 'en',
    dateFormat: saved.dateFormat ?? 'YYYY-MM-DD',
    sessionTimeout: saved.sessionTimeout ?? '30',
  });

  const update = (key) => (value) => setSettings((s) => ({ ...s, [key]: value }));

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    showToast({ type: 'success', message: 'Settings saved.' });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="mt-1 text-sm text-[#64748B]">Manage your personal preferences and notification settings.</p>
      </div>

      <Section icon={MdNotifications} title="Notifications">
        <Toggle label="Email notifications" description="Receive updates via email" checked={settings.emailNotifications} onChange={update('emailNotifications')} />
        <Toggle label="Appointment reminders" description="Get reminded before appointments" checked={settings.appointmentReminders} onChange={update('appointmentReminders')} />
        <Toggle label="Medication reminders" description="Alerts for scheduled medications" checked={settings.medicationReminders} onChange={update('medicationReminders')} />
        <Toggle label="AI risk alerts" description="Notifications for high-risk predictions" checked={settings.riskAlerts} onChange={update('riskAlerts')} />
      </Section>

      <Section icon={MdPalette} title="Display">
        <Toggle label="Compact view" description="Reduce spacing for denser layout" checked={settings.compactView} onChange={update('compactView')} />
        <SelectField
          label="Date format"
          value={settings.dateFormat}
          onChange={update('dateFormat')}
          options={[
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
          ]}
        />
      </Section>

      <Section icon={MdLanguage} title="Language & Region">
        <SelectField
          label="Language"
          value={settings.language}
          onChange={update('language')}
          options={[
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'French' },
            { value: 'rw', label: 'Kinyarwanda' },
          ]}
        />
      </Section>

      <Section icon={MdSecurity} title="Security">
        <SelectField
          label="Session timeout"
          value={settings.sessionTimeout}
          onChange={update('sessionTimeout')}
          options={[
            { value: '15', label: '15 minutes' },
            { value: '30', label: '30 minutes' },
            { value: '60', label: '1 hour' },
            { value: '120', label: '2 hours' },
          ]}
        />
        <p className="text-xs text-[#94A3B8]">
          To change your password, contact your system administrator.
        </p>
      </Section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors"
        >
          <MdCheck size={16} /> Save settings
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
