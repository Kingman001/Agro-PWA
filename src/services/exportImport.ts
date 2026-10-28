/**
 * Spreadsheet utility: CSV export and import helpers
 */

export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) return;

  const separator = ',';
  const keys = Object.keys(rows[0]);

  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            if (typeof cell === 'object') {
              cell = JSON.stringify(cell);
            }
            cell = cell.toString().replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r\n|\n/);
  if (lines.length < 2) return [];

  // Parse header
  const headers = splitCSVLine(lines[0]);
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    if (!currentLine) continue;
    const values = splitCSVLine(currentLine);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] ? values[index].trim() : '';
    });
    results.push(row);
  }

  return results;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let startValueIndex = 0;
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      let val = line.substring(startValueIndex, i).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      result.push(val);
      startValueIndex = i + 1;
    }
  }

  let finalVal = line.substring(startValueIndex).trim();
  if (finalVal.startsWith('"') && finalVal.endsWith('"')) {
    finalVal = finalVal.substring(1, finalVal.length - 1).replace(/""/g, '"');
  }
  result.push(finalVal);

  return result;
}
