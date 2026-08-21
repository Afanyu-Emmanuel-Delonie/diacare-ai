import Button from '../../../components/common/Button.jsx';
import FilterPanel from '../../../components/common/FilterPanel.jsx';
import SearchInput from '../../../components/common/SearchInput.jsx';

function KnowledgeControls({ search, setSearch, category, setCategory, categories = [], showBookmarked, setShowBookmarked }) {
  return (
    <FilterPanel>
      <SearchInput id="knowledgeSearch" label="Search education content" value={search} onChange={setSearch} placeholder="Search topics, foods, categories, or guidance" />
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#334155]">Category</label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="min-h-11 w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        >
          {['ALL', ...categories].map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <Button type="button" variant={showBookmarked ? 'primary' : 'secondary'} className="w-full" onClick={() => setShowBookmarked((current) => !current)}>
          {showBookmarked ? 'Show all' : 'Bookmarked only'}
        </Button>
      </div>
    </FilterPanel>
  );
}

export default KnowledgeControls;
