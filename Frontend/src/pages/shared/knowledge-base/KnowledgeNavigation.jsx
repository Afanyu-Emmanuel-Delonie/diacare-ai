import { NavLink } from 'react-router-dom';
import {
  MdBloodtype, MdScience, MdMedication, MdWarning,
  MdDirectionsRun, MdRestaurant, MdLocalDining, MdHelp, MdInfo,
} from 'react-icons/md';

export const knowledgePages = [
  { key: 'diabetes-types',           title: 'Diabetes Types',       path: '/dashboard/knowledge/diabetes-types',           icon: MdInfo },
  { key: 'blood-sugar-ranges',       title: 'Blood Sugar Ranges',   path: '/dashboard/knowledge/blood-sugar-ranges',       icon: MdBloodtype },
  { key: 'hba1c-ranges',             title: 'HbA1c Ranges',         path: '/dashboard/knowledge/hba1c-ranges',             icon: MdScience },
  { key: 'medication-education',     title: 'Medication Education', path: '/dashboard/knowledge/medication-education',     icon: MdMedication },
  { key: 'complications',            title: 'Complications',        path: '/dashboard/knowledge/complications',            icon: MdWarning },
  { key: 'emergency-signs',          title: 'Emergency Signs',      path: '/dashboard/knowledge/emergency-signs',          icon: MdWarning },
  { key: 'exercise-recommendations', title: 'Exercise',             path: '/dashboard/knowledge/exercise-recommendations', icon: MdDirectionsRun },
  { key: 'food-guidance',            title: 'Food Guidance',        path: '/dashboard/knowledge/food-guidance',            icon: MdRestaurant },
  { key: 'rwanda-local-foods',       title: 'Rwanda Local Foods',   path: '/dashboard/knowledge/rwanda-local-foods',       icon: MdLocalDining },
  { key: 'faqs',                     title: 'FAQs',                 path: '/dashboard/knowledge/faqs',                    icon: MdHelp },
];

/* Vertical sidebar nav (md+), horizontal scroll strip (< md) */
function KnowledgeNavigation() {
  return (
    <>
      {/* Mobile: horizontal scroll strip */}
      <nav aria-label="Knowledge topics" className="md:hidden overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex min-w-max gap-2">
          {knowledgePages.map(({ key, title, path, icon: Icon }) => (
            <NavLink
              key={key}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-sm'
                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]/30 hover:text-[#2563EB]'
                }`
              }
            >
              <Icon size={16} aria-hidden="true" />
              {title}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop: vertical sidebar */}
      <nav aria-label="Knowledge topics" className="hidden md:flex flex-col gap-1">
        {knowledgePages.map(({ key, title, path, icon: Icon }) => (
          <NavLink
            key={key}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-sm shadow-[#2563EB]/20'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
              }`
            }
          >
            <Icon size={17} aria-hidden="true" className="shrink-0" />
            {title}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default KnowledgeNavigation;
