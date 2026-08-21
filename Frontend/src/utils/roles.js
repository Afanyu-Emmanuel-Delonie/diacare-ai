export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  PATIENT: 'PATIENT',
  CAREGIVER: 'CAREGIVER'
};

export const roleLabels = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.DOCTOR]: 'Doctor',
  [ROLES.NURSE]: 'Nurse',
  [ROLES.PATIENT]: 'Patient',
  [ROLES.CAREGIVER]: 'Caregiver'
};

export const roleDashboardPaths = {
  [ROLES.ADMIN]: '/dashboard/admin',
  [ROLES.DOCTOR]: '/dashboard/doctor',
  [ROLES.NURSE]: '/dashboard/nurse',
  [ROLES.PATIENT]: '/dashboard/patient',
  [ROLES.CAREGIVER]: '/dashboard/caregiver'
};

export const getDashboardPath = (role) => roleDashboardPaths[role] || roleDashboardPaths[ROLES.PATIENT];
