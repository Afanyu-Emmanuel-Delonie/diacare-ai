import Button from './Button.jsx';

function downloadTextFile(fileName, content, type) {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function toCsv(data) {
  if (!data.length) {
    return '';
  }

  const keys = Object.keys(data[0]).filter((key) => typeof data[0][key] !== 'object');
  const rows = data.map((item) =>
    keys
      .map((key) => `"${String(item[key] ?? '').replaceAll('"', '""')}"`)
      .join(',')
  );
  return [keys.join(','), ...rows].join('\n');
}

function ExportButtons({ data = [], fileName = 'export', includePrint = true }) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button
        variant="secondary"
        disabled={!data.length}
        onClick={() => downloadTextFile(`${fileName}.csv`, toCsv(data), 'text/csv;charset=utf-8')}
      >
        CSV
      </Button>
      <Button
        variant="secondary"
        disabled={!data.length}
        onClick={() => downloadTextFile(`${fileName}.json`, JSON.stringify(data, null, 2), 'application/json;charset=utf-8')}
      >
        JSON
      </Button>
      {includePrint && (
        <Button variant="secondary" onClick={() => window.print()}>
          Print
        </Button>
      )}
    </div>
  );
}

export default ExportButtons;
