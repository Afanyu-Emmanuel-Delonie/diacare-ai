import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo.jsx';

function AuthLayout({ title, description, children, footerText, footerLinkText, footerTo, wide = false }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 py-12">

      <div className={`w-full ${wide ? 'max-w-[560px]' : 'max-w-[420px]'} rounded-2xl border border-[#e2e8f0] bg-white px-8 py-9 shadow-sm`}>
        <div className="mb-7">
          <div className="mb-6 flex justify-center">
            <Logo showName={false} size={44} />
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] text-center leading-tight">{title}</h1>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-[#64748b] text-center">{description}</p>
          )}
        </div>

        {children}

        {footerTo && (
          <p className="mt-6 text-center text-sm text-[#64748b]">
            {footerText}{' '}
            <Link to={footerTo} className="font-semibold text-[#2563EB] hover:underline">
              {footerLinkText}
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

export default AuthLayout;
