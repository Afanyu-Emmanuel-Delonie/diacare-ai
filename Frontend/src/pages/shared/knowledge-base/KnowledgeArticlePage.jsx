import { useEffect, useMemo, useState } from 'react';
import {
  MdBookmark, MdBookmarkBorder, MdMenuBook,
  MdOutlineAutoStories, MdSearch,
} from 'react-icons/md';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import { getKnowledgeArticles, getKnowledgeDisclaimer } from '../../../services/knowledgeBaseService.js';
import KnowledgeDisclaimer, { DEFAULT_DISCLAIMER } from './KnowledgeDisclaimer.jsx';
import KnowledgeNavigation from './KnowledgeNavigation.jsx';
import { getBookmarks, toggleBookmark } from './bookmarkStorage.js';

const pageContent = {
  'diabetes-types': {
    title: 'Diabetes Types',
    description: 'Educational overview of common diabetes categories.',
    topicKeys: ['type-1-diabetes', 'type-2-diabetes', 'gestational-diabetes', 'prediabetes', 'other-specific-types'],
    keywords: ['type 1', 'type 2', 'gestational', 'prediabetes', 'specific types'],
    fallback: [
      { title: 'Type 1 Diabetes', category: 'Education', content: 'Type 1 diabetes happens when the body produces little or no insulin. It requires ongoing clinical care and insulin treatment planned by a qualified healthcare professional.' },
      { title: 'Type 2 Diabetes', category: 'Education', content: 'Type 2 diabetes is commonly linked with insulin resistance. Monitoring, food choices, physical activity, medication, and regular follow-up may all be part of professional care.' },
      { title: 'Gestational Diabetes', category: 'Education', content: 'Gestational diabetes develops during pregnancy and needs close follow-up with maternity and diabetes care providers.' },
      { title: 'Prediabetes and Other Specific Types', category: 'Education', content: 'Prediabetes means blood sugar is higher than usual but not in the diabetes range. Other specific types may be linked to medicine, pancreatic disease, genetics, or other medical causes.' },
    ],
  },
  'blood-sugar-ranges': {
    title: 'Blood Sugar Ranges',
    description: 'General education about glucose readings and why targets should be individualized.',
    topicKeys: ['blood-sugar-ranges'], keywords: ['blood sugar', 'glucose'],
    fallback: [
      { title: 'Understanding Glucose Readings', category: 'Education', content: 'Blood sugar readings help show how food, exercise, illness, stress, and medication affect diabetes monitoring. Target ranges can differ by age, pregnancy, other illnesses, and clinical plan.' },
      { title: 'When Readings Are Concerning', category: 'Education', content: 'Very high or very low readings, especially with symptoms, should be discussed urgently with a qualified healthcare professional.' },
    ],
  },
  'hba1c-ranges': {
    title: 'HbA1c Ranges',
    description: 'Educational guide to HbA1c as a long-term blood sugar marker.',
    topicKeys: ['hba1c-ranges'], keywords: ['hba1c', 'a1c'],
    fallback: [
      { title: 'What HbA1c Means', category: 'Education', content: 'HbA1c reflects average blood sugar over about two to three months. Results should be interpreted by a healthcare professional together with daily readings and overall health.' },
      { title: 'Individual Targets', category: 'Education', content: 'HbA1c targets are not the same for everyone. Pregnancy, age, risk of low blood sugar, and other medical conditions can change the recommended goal.' },
    ],
  },
  'medication-education': {
    title: 'Diabetes Medications',
    description: 'General safety education for diabetes medicines.',
    topicKeys: ['medication-education'], keywords: ['medication', 'medicine', 'insulin'],
    fallback: [
      { title: 'Medication Safety', category: 'Safety', content: 'Diabetes medicines should be taken only as prescribed. Do not start, stop, or change a dose without advice from a qualified healthcare professional.' },
      { title: 'Adherence and Follow-up', category: 'Safety', content: 'Keeping a medication schedule and attending follow-up appointments helps the care team review safety, side effects, and treatment progress.' },
    ],
  },
  complications: {
    title: 'Diabetes Complications',
    description: 'Educational overview of possible complications and the value of regular monitoring.',
    topicKeys: ['complications'], keywords: ['complication'],
    fallback: [
      { title: 'Possible Complications', category: 'Education', content: 'Long-term high blood sugar can affect the eyes, kidneys, nerves, heart, blood vessels, teeth, and feet. Regular checkups support early detection and care.' },
      { title: 'Prevention and Monitoring', category: 'Education', content: 'Healthy routines, blood sugar monitoring, medication adherence, and professional reviews can reduce risk, but care plans must be personalized.' },
    ],
  },
  'emergency-signs': {
    title: 'Emergency Signs',
    description: 'Warning signs that may need urgent medical attention.',
    topicKeys: ['emergency-signs'], keywords: ['emergency', 'urgent', 'warning signs'],
    fallback: [
      { title: 'Seek Urgent Help', category: 'Emergency', content: 'Confusion, fainting, seizures, severe weakness, chest pain, difficulty breathing, repeated vomiting, or symptoms of very low or very high blood sugar may need urgent medical help.' },
      { title: 'Do Not Wait', category: 'Emergency', content: 'Emergency symptoms should not be managed through educational content. Contact emergency services or a qualified healthcare professional.' },
    ],
  },
  'exercise-recommendations': {
    title: 'Exercise Recommendations',
    description: 'General physical activity education for diabetes monitoring.',
    topicKeys: ['exercise-recommendations'], keywords: ['exercise', 'physical activity'],
    fallback: [
      { title: 'Activity and Monitoring', category: 'Lifestyle', content: 'Regular movement can support blood sugar control, heart health, strength, and wellbeing. People using insulin or some medicines may need guidance on preventing low blood sugar.' },
      { title: 'Start Safely', category: 'Lifestyle', content: 'New exercise routines should be discussed with a healthcare professional, especially for pregnancy, heart disease, foot problems, or frequent low blood sugar.' },
    ],
  },
  'food-guidance': {
    title: 'Food Guidance',
    description: 'General nutrition education for balanced diabetes monitoring.',
    topicKeys: ['food-guidance'], keywords: ['food', 'nutrition', 'meal'],
    fallback: [
      { title: 'Balanced Meals', category: 'Nutrition', content: 'A balanced meal often includes vegetables, protein, high-fiber carbohydrates, and healthy fats. Portion size and meal timing can affect blood sugar readings.' },
      { title: 'Personalized Advice', category: 'Nutrition', content: 'Food plans should respect culture, budget, preferences, and medical needs. A qualified professional can help create an individual plan.' },
    ],
  },
  faqs: {
    title: 'Frequently Asked Questions',
    description: 'Common educational questions about diabetes monitoring and care workflows.',
    topicKeys: ['faq', 'faqs', 'frequently-asked-questions'], keywords: ['faq', 'question'],
    fallback: [
      { title: 'Can this system diagnose diabetes?', category: 'FAQ', content: 'No. This system supports monitoring, education, reminders, and communication. Diagnosis must come from a qualified healthcare professional.' },
      { title: 'Can I change medication based on app information?', category: 'FAQ', content: 'No. Do not start, stop, or change medication or dosage using app content. Always follow advice from a qualified healthcare professional.' },
      { title: 'What should I do with emergency signs?', category: 'FAQ', content: 'Emergency symptoms should be handled urgently through a healthcare provider or emergency services. Educational pages should not delay urgent care.' },
      { title: 'Are Rwanda local foods forbidden?', category: 'FAQ', content: 'The food guide is general education. It groups foods as better choice, moderation, or limit to support portion awareness, not to ban culturally important foods.' },
    ],
  },
};

const CATEGORY_COLORS = {
  Education: { color: '#2563EB', bg: '#EFF6FF' },
  Safety:    { color: '#F59E0B', bg: '#FFFBEB' },
  Emergency: { color: '#DC2626', bg: '#FEF2F2' },
  Lifestyle: { color: '#10B981', bg: '#ECFDF5' },
  Nutrition: { color: '#10B981', bg: '#ECFDF5' },
  FAQ:       { color: '#8B5CF6', bg: '#F5F3FF' },
};

function normalize(v) { return String(v || '').toLowerCase(); }

function ArticleCard({ article, bookmarkId, bookmarked, onBookmark }) {
  const cat = article.category || 'Education';
  const { color, bg } = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Education;
  const paragraphs = String(article.content || '').split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const readTime = Math.max(1, Math.ceil(String(article.content || '').split(/\s+/).length / 180));

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} aria-hidden="true" />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
              style={{ background: bg, color }}
            >
              {cat}
            </span>
            <h2 className="mt-2.5 text-base font-bold leading-snug text-[#0F172A] sm:text-lg">{article.title}</h2>
          </div>
          <button
            type="button"
            onClick={() => onBookmark(bookmarkId)}
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              bookmarked
                ? 'border-[#2563EB]/20 bg-[#EFF6FF] text-[#2563EB]'
                : 'border-[#E2E8F0] text-[#94A3B8] hover:border-[#2563EB]/30 hover:bg-[#F8FAFC] hover:text-[#2563EB]'
            }`}
            aria-label={`${bookmarked ? 'Remove' : 'Save'} bookmark for ${article.title}`}
            aria-pressed={bookmarked}
          >
            {bookmarked ? <MdBookmark size={18} /> : <MdBookmarkBorder size={18} />}
          </button>
        </div>

        {/* Body */}
        <div className="mt-3 flex-1 space-y-2.5 text-sm leading-7 text-[#475569]">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-[#F1F5F9] pt-3">
          <span className="text-xs text-[#94A3B8]">{readTime} min read</span>
          <span className="text-xs font-medium text-[#64748B]">Educational guide</span>
        </div>
      </div>
    </article>
  );
}

function KnowledgeArticlePage({ pageKey }) {
  const [articles, setArticles] = useState([]);
  const [disclaimer, setDisclaimer] = useState(DEFAULT_DISCLAIMER);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState(getBookmarks());

  const config = pageContent[pageKey] || pageContent['diabetes-types'];

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getKnowledgeArticles(), getKnowledgeDisclaimer()])
      .then(([data, disc]) => {
        if (!mounted) return;
        setArticles(Array.isArray(data) ? data : []);
        setDisclaimer(disc || DEFAULT_DISCLAIMER);
      })
      .catch(() => { if (mounted) { setArticles([]); setDisclaimer(DEFAULT_DISCLAIMER); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const source = useMemo(() => {
    const matched = articles.filter((a) =>
      config.topicKeys.some((k) => normalize(a.topicKey) === normalize(k)) ||
      config.keywords.some((kw) => normalize(a.title).includes(normalize(kw)) || normalize(a.category).includes(normalize(kw)))
    );
    return matched.length > 0 ? matched : config.fallback;
  }, [articles, config]);

  const categories = useMemo(() => ['ALL', ...Array.from(new Set(source.map((a) => a.category || 'Education'))).sort()], [source]);

  const filtered = useMemo(() => {
    const q = normalize(search);
    return source.filter((a, i) => {
      const bid = a.id ? `article-${a.id}` : `${pageKey}-${a.title}-${i}`;
      return (
        (!q || normalize(a.title).includes(q) || normalize(a.content).includes(q)) &&
        (category === 'ALL' || normalize(a.category || 'Education') === normalize(category)) &&
        (!showBookmarked || bookmarks.includes(bid))
      );
    });
  }, [source, search, category, showBookmarked, bookmarks, pageKey]);

  const handleBookmark = (bid) => setBookmarks(toggleBookmark(bid));

  return (
    /* Two-column layout: sidebar (desktop) + main content */
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">

      {/* Sidebar nav — sticky on desktop */}
      <aside className="md:w-56 md:shrink-0 lg:w-60">
        <div className="md:sticky md:top-6">
          <p className="mb-3 hidden px-1 text-[11px] font-bold uppercase tracking-widest text-[#94A3B8] md:block">
            Topics
          </p>
          <KnowledgeNavigation />
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-6">

        {/* Page hero */}
        <section className="relative overflow-hidden rounded-2xl border border-[#DBEAFE] bg-gradient-to-br from-[#EFF6FF] via-white to-[#ECFDF5] px-5 py-6 sm:px-7 sm:py-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#2563EB]/[0.07]" aria-hidden="true" />
          <div className="relative">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25">
              <MdMenuBook size={22} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">{config.title}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#64748B] sm:text-base sm:leading-7">{config.description}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-medium text-[#475569]">
              <span className="flex items-center gap-1.5">
                <MdOutlineAutoStories className="text-[#2563EB]" size={16} />
                {source.length} resources
              </span>
              <span className="flex items-center gap-1.5">
                <MdBookmark className="text-[#F59E0B]" size={16} />
                Save articles for later
              </span>
            </div>
          </div>
        </section>

        <KnowledgeDisclaimer text={disclaimer} />

        {/* Filters */}
        <section className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4" aria-label="Article filters">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex flex-1 items-center gap-2.5 rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 shadow-sm transition focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10">
              <MdSearch size={18} className="shrink-0 text-[#94A3B8]" aria-hidden="true" />
              <span className="sr-only">Search articles</span>
              <input
                type="search"
                placeholder={`Search ${config.title.toLowerCase()}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowBookmarked((v) => !v)}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                showBookmarked
                  ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                  : 'border-[#CBD5E1] bg-white text-[#475569] hover:border-[#2563EB]/40 hover:text-[#2563EB]'
              }`}
              aria-pressed={showBookmarked}
            >
              <MdBookmark size={16} /> Saved
            </button>
          </div>

          {/* Category pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  category === cat
                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]/30 hover:text-[#2563EB]'
                }`}
                aria-pressed={category === cat}
              >
                {cat === 'ALL' ? 'All' : cat}
              </button>
            ))}
            <span className="ml-auto text-xs text-[#94A3B8]">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </section>

        {loading && <LoadingSkeleton rows={4} />}

        {!loading && filtered.length === 0 && (
          <EmptyState title="No articles found" message="No educational content matches the current filters." />
        )}

        {!loading && filtered.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2" aria-label={`${config.title} articles`}>
            {filtered.map((article, i) => {
              const bid = article.id ? `article-${article.id}` : `${pageKey}-${article.title}-${i}`;
              return (
                <ArticleCard
                  key={bid}
                  article={article}
                  bookmarkId={bid}
                  bookmarked={bookmarks.includes(bid)}
                  onBookmark={handleBookmark}
                />
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

export default KnowledgeArticlePage;
