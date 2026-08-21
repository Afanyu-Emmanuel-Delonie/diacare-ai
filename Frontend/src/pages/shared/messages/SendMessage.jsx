import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AlertBanner from '../../../components/common/AlertBanner.jsx';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import Input from '../../../components/common/Input.jsx';
import PatientSelect from '../../../components/common/PatientSelect.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { buildMessagePayload, recipientOptionsFor, sendMessage } from '../../../services/messageService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';

function SendMessage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userRole, user } = useAuth();
  const { showToast } = useToast();
  const isPatient = userRole === ROLES.PATIENT;
  const recipientOptions = useMemo(() => recipientOptionsFor(userRole), [userRole]);
  const [formData, setFormData] = useState({
    patientId: isPatient ? String(user?.id || '') : (searchParams.get('patientId') || ''),
    subject: '',
    content: '',
    attachment: '',
    recipientRole: recipientOptions[0] || ROLES.DOCTOR
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await sendMessage(buildMessagePayload(formData));
      showToast({ type: 'success', message: 'Message sent successfully.' });
      navigate(`/dashboard/messages/${response.data.id}`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to send message.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AlertBanner
        title="Secure communication"
        message="Messages are linked to authorized patient records. Do not include urgent emergency requests here; follow the emergency care process when urgent help is needed."
        variant="info"
        badge="SECURE"
      />

      <Card className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#334155]">New Conversation</h1>
          <p className="mt-2 text-sm text-[#334155]/80">Start a secure patient-related conversation with an allowed role.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <PatientSelect name="patientId" value={formData.patientId} onChange={updateField} required disabled={Boolean(searchParams.get('patientId'))} />
            <div className="space-y-2">
              <label htmlFor="recipientRole" className="block text-sm font-semibold text-[#334155]">Receiver role</label>
              <select
                id="recipientRole"
                name="recipientRole"
                value={formData.recipientRole}
                onChange={updateField}
                className="min-h-11 w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              >
                {recipientOptions.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
          </div>

          <Input id="subject" name="subject" label="Subject" maxLength="160" value={formData.subject} onChange={updateField} required />

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-semibold text-[#334155]">Message</label>
            <textarea
              id="content"
              name="content"
              rows={8}
              maxLength={2000}
              value={formData.content}
              onChange={updateField}
              required
              className="w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 py-2 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <p className="text-xs text-[#334155]/70">{formData.content.length}/2000 characters</p>
          </div>

          <Input id="attachment" name="attachment" label="Attachment reference (optional, display only)" value={formData.attachment} onChange={updateField} placeholder="Backend attachment upload is not available yet" />
          <p className="text-sm text-[#334155]/75">Attachment upload is not sent because the current backend message API does not support attachment fields yet.</p>

          {error && <p className="rounded-md border border-[#DC2626]/25 bg-[#DC2626]/10 px-3 py-2 text-sm text-[#DC2626]">{error}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || recipientOptions.length === 0}>{submitting ? 'Sending...' : 'Send message'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SendMessage;
