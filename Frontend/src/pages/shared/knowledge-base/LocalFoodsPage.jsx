import { useEffect, useMemo, useState } from 'react';
import { MdSearch, MdBookmark, MdBookmarkBorder, MdLocalDining } from 'react-icons/md';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import { getLocalFoodGuides, getLocalFoodGuidanceNote } from '../../../services/knowledgeBaseService.js';
import KnowledgeDisclaimer, { DEFAULT_DISCLAIMER } from './KnowledgeDisclaimer.jsx';
import KnowledgeNavigation from './KnowledgeNavigation.jsx';
import { getBookmarks, toggleBookmark } from './bookmarkStorage.js';

const LEVEL_META = {
  BETTER_CHOICE: { label: 'Better Choice', color: '#10B981', bg: '#ECFDF5', border: '#10B981' },
  MODERATION:    { label: 'Moderation',    color: '#F59E0B', bg: '#FFFBEB', border: '#F59E0B' },
  LIMIT:         { label: 'Limit',         color: '#DC2626', bg: '#FEF2F2', border: '#DC2626' },
};

const fallbackFoods = [
  ['Isombe','Vegetables','BETTER_CHOICE','Use moderate oil and avoid too much salt.','Cassava leaves support vegetable intake.'],
  ['Ibihaza','Vegetables','BETTER_CHOICE','Use as part of a balanced plate.','Pumpkin is a helpful vegetable choice.'],
  ['Dodo','Vegetables','BETTER_CHOICE','Fill part of the plate with leafy vegetables.','Leafy greens are useful for fiber.'],
  ['Ubugari','Starchy foods','MODERATION','Keep portions controlled.','Large portions can raise blood sugar.'],
  ['Umuceri','Starchy foods','MODERATION','Choose modest portions and pair with vegetables.','Rice portion size matters.'],
  ['Ibijumba','Starchy foods','MODERATION','Use controlled portions.','Sweet potatoes can fit into balanced meals.'],
  ['Ibirayi','Starchy foods','MODERATION','Prefer boiled over fried.','Potatoes can raise blood sugar depending on portion.'],
  ['Matoke','Starchy foods','MODERATION','Use controlled portions.','Green bananas are starchy.'],
  ['Ibishyimbo','Protein and legumes','BETTER_CHOICE','Pair with vegetables and controlled starch.','Beans provide fiber and plant protein.'],
  ['Akawunga','Starchy foods','MODERATION','Keep portions controlled.','Maize flour can raise blood sugar if portions are large.'],
  ['Chapati','Refined starch/fat','LIMIT','Limit frequency and portion size.','Often made with refined flour and added fat.'],
  ['Tilapia','Protein','BETTER_CHOICE','Prefer grilled or boiled.','Fish can be a good protein choice.'],
  ['Sambaza','Protein','BETTER_CHOICE','Prefer less oil and less salt.','Small fish support protein intake.'],
  ['Goat Meat','Protein','MODERATION','Choose lean portions.','Limit fatty cuts and large portions.'],
  ['Chicken','Protein','BETTER_CHOICE','Prefer skinless, grilled or baked.','Lean chicken is a good protein choice.'],
  ['Beef','Protein','MODERATION','Choose lean portions.','Large fatty portions may affect heart health.'],
  ['Milk','Dairy','MODERATION','Use unsweetened portions.','Milk contains natural carbohydrate.'],
  ['Yogurt','Dairy','MODERATION','Choose unsweetened yogurt.','Sweetened yogurt contains added sugar.'],
  ['Bananas','Fruit','MODERATION','Use one small portion at a time.','Fruit contains natural sugar.'],
  ['Mangoes','Fruit','MODERATION','Use small portions.','Mango can raise blood sugar if portions are large.'],
  ['Pineapple','Fruit','MODERATION','Use small portions.','Pineapple contains natural sugar.'],
  ['Cassava','Starchy foods','MODERATION','Use controlled portions.','Cassava is carbohydrate-rich.'],
  ['Groundnuts','Fats/protein','MODERATION','Use a small handful.','Nut portions are calorie-dense.'],
  ['Sweet Potatoes','Starchy foods','MODERATION','Use controlled portions.','Same guidance as ibijumba.'],
].map(([foodName, category, recommendationLevel, portionGuidance, notes], id) => ({
  id: `fallback-${id}`, foodName, category, recommendationLevel, portionGuidance, notes,
}));

/* Mobile card */
function FoodCard({ food, bookmarked, onBookmark }) {
  const meta = LEVEL_META[food.recommendationLevel] || LEVEL_META.MODERATION;
  const bid = `food-${food.id || food.foodName}`;
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: `${meta.border}30` }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-[#0F172A]">{food.foodName}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">{food.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: meta.bg, color: meta.color }}>
            {meta.label}
          </span>
          <button type="button" onClick={() => onBookmark(bid)} className="text-[#94A3B8] hover:text-[#2563EB] transition-colors">
            {bookmarked ? <MdBookmark size={18} className="text-[#2563EB]" /> : <MdBookmarkBorder size={18} />}
          </button>
        </div>
      </div>
      <p className="mt-2.5 text-xs leading-5 text-[#475569]"><span className="font-semibold text-[#334155]">Portion: </span>{food.portionGuidance}</p>
      {food.notes && <p className="mt-1 text-xs leading-5 text-[#94A3B8]">{food.notes}</p>}
    </div>
  );
}

/* Desktop table row */
function FoodRow({ food, bookmarked, onBookmark }) {
  const meta = LEVEL_META[food.recommendationLevel] || LEVEL_META.MODERATION;
  const bid = `food-${food.id || food.foodName}`;
  return (
    <tr className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
      <td className="px-4 py-3 font-semibold text-sm text-[#0F172A]">{food.foodName}</td>
      <td className="px-4 py-3 text-sm text-[#64748B]">{food.category}</td>
      <td className="px-4 py-3">
        <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-[#475569]">{food.portionGuidance}</td>
      <td className="px-4 py-3 text-sm text-[#94A3B8]">{food.notes}</td>
      <td className="px-4 py-3">
        <button type="button" onClick={() => onBookmark(bid)} className="text-[#94A3B8] hover:text-[#2563EB] transition-colors">
          {bookmarked ? <MdBookmark size={18} className="text-[#2563EB]" /> : <MdBookmarkBorder size={18} />}
        </button>
      </td>
    </tr>
  );
}

function LocalFoodsPage() {
  const [foods, setFoods] = useState([]);
  const [guidanceNote, setGuidanceNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [bookmarks, setBookmarks] = useState(getBookmarks());

  useEffect(() => {
    let mounted = true;
    Promise.all([getLocalFoodGuides(), getLocalFoodGuidanceNote()])
      .then(([data, note]) => {
        if (!mounted) return;
        setFoods(Array.isArray(data) ? data : []);
        setGuidanceNote(typeof note === 'string' ? note : '');
      })
      .catch(() => { if (mounted) { setFoods([]); setGuidanceNote(''); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const source = foods.length > 0 ? foods : fallbackFoods;
  const categories = useMemo(() => ['ALL', ...Array.from(new Set(source.map((f) => f.category || 'General'))).sort()], [source]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return source.filter((f) => {
      const matchSearch = !q || f.foodName?.toLowerCase().includes(q) || f.category?.toLowerCase().includes(q) || f.portionGuidance?.toLowerCase().includes(q);
      const matchCat = category === 'ALL' || f.category === category;
      const matchLevel = levelFilter === 'ALL' || f.recommendationLevel === levelFilter;
      return matchSearch && matchCat && matchLevel;
    });
  }, [source, search, category, levelFilter]);

  const counts = useMemo(() => ({
    BETTER_CHOICE: source.filter((f) => f.recommendationLevel === 'BETTER_CHOICE').length,
    MODERATION:    source.filter((f) => f.recommendationLevel === 'MODERATION').length,
    LIMIT:         source.filter((f) => f.recommendationLevel === 'LIMIT').length,
  }), [source]);

  const handleBookmark = (bid) => setBookmarks(toggleBookmark(bid));

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">

      {/* Sidebar nav */}
      <aside className="md:w-56 md:shrink-0 lg:w-60">
        <div className="md:sticky md:top-6">
          <p className="mb-3 hidden px-1 text-[11px] font-bold uppercase tracking-widest text-[#94A3B8] md:block">Topics</p>
          <KnowledgeNavigation />
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1 space-y-6">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-[#D1FAE5] bg-gradient-to-br from-[#ECFDF5] via-white to-[#EFF6FF] px-5 py-6 sm:px-7 sm:py-8">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#10B981]/[0.08]" aria-hidden="true" />
          <div className="relative">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#10B981] text-white shadow-md shadow-[#10B981]/25">
              <MdLocalDining size={22} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">Rwanda Local Foods</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#64748B]">
              General education about common local foods, portion awareness, and balanced choices for diabetes monitoring.
            </p>
          </div>
        </section>

        <KnowledgeDisclaimer text={DEFAULT_DISCLAIMER} />

        {/* Level summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(LEVEL_META).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => setLevelFilter(levelFilter === key ? 'ALL' : key)}
              className="rounded-xl border p-3 text-center transition-all sm:p-4"
              style={
                levelFilter === key
                  ? { borderColor: meta.border, background: meta.bg, boxShadow: `0 0 0 2px ${meta.border}40` }
                  : { borderColor: '#E2E8F0', background: '#fff' }
              }
            >
              <p className="text-xl font-bold sm:text-2xl" style={{ color: meta.color }}>{counts[key]}</p>
              <p className="mt-0.5 text-[11px] font-semibold sm:text-xs" style={{ color: meta.color }}>{meta.label}</p>
            </button>
          ))}
        </div>

        {guidanceNote && (
          <div className="rounded-xl border border-[#2563EB]/20 bg-[#EFF6FF] px-4 py-3 text-sm text-[#1E40AF]">
            {guidanceNote}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex flex-1 min-w-[180px] items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 shadow-sm transition focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10">
            <MdSearch size={17} className="shrink-0 text-[#94A3B8]" />
            <span className="sr-only">Search foods</span>
            <input
              type="text"
              placeholder="Search foods…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  category === cat
                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]/30 hover:text-[#2563EB]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="text-xs text-[#94A3B8] sm:ml-auto">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading && <LoadingSkeleton rows={5} />}

        {!loading && filtered.length === 0 && (
          <EmptyState title="No foods found" message="No local food guidance matches the current filters." />
        )}

        {!loading && filtered.length > 0 && (
          <>
            {/* Mobile: card grid */}
            <div className="grid gap-3 sm:grid-cols-2 md:hidden">
              {filtered.map((food) => {
                const bid = `food-${food.id || food.foodName}`;
                return <FoodCard key={bid} food={food} bookmarked={bookmarks.includes(bid)} onBookmark={handleBookmark} />;
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                      {['Food', 'Category', 'Recommendation', 'Portion Guidance', 'Notes', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((food) => {
                      const bid = `food-${food.id || food.foodName}`;
                      return <FoodRow key={bid} food={food} bookmarked={bookmarks.includes(bid)} onBookmark={handleBookmark} />;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LocalFoodsPage;
