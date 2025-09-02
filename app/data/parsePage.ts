export interface PageRange {
  start: number;
  end: number;
}

export function parsePage(input: string): PageRange | null {
  const cleaned = input
    .toLowerCase()
    .replace(/p\.?/g, '')
    .replace(/\s+/g, '')
    .trim();

  const rangeMatch = cleaned.match(/^(\d+)[-~–—](\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    
    if (start >= 1 && end >= start) {
      return { start, end };
    }
    return null;
  }

  const singleMatch = cleaned.match(/^(\d+)$/);
  if (singleMatch) {
    const page = parseInt(singleMatch[1], 10);
    if (page >= 1) {
      return { start: page, end: page };
    }
  }

  return null;
}