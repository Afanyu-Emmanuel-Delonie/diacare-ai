import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import Input from '../../../components/common/Input.jsx';
import { ROLES } from '../../../utils/roles.js';

function UserForm({ title, description, formData, onChange, onSubmit, submitting, submitLabel, passwordRequired = false, error, showStatus = true }) {
  return (
    <Card className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#334155]">{title}</h1>
        {description && <p className="mt-2 text-sm text-[#334155]/80">{description}</p>}
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input id="firstName" name="firstName" label="First name" value={formData.firstName} onChange={onChange} minLength={2} />
          <Input id="lastName" name="lastName" label="Last name" value={formData.lastName} onChange={onChange} minLength={2} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input id="email" name="email" label="Email" type="email" value={formData.email} onChange={onChange} required />
          <Input id="phoneNumber" name="phoneNumber" label="Phone number" type="tel" value={formData.phoneNumber} onChange={onChange} placeholder="+250..." />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            id="password"
            name="password"
            label={passwordRequired ? 'Password' : 'New password'}
            type="password"
            value={formData.password}
            onChange={onChange}
            minLength={8}
            required={passwordRequired}
            placeholder={passwordRequired ? '' : 'Leave blank to keep current password'}
          />
          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-semibold text-[#334155]">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={onChange}
              className="min-h-11 w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              required
            >
              {Object.values(ROLES).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showStatus && (
          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-semibold text-[#334155]">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={onChange}
              className="min-h-11 w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        )}

        {error && <p className="rounded-md border border-[#DC2626]/25 bg-[#DC2626]/10 px-3 py-2 text-sm text-[#DC2626]">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default UserForm;
