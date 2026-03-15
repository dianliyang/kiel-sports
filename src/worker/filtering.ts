export type WorkoutBrowseRecord = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  category: string | null;
  weekday: string | null;
  timeLabel: string | null;
  location: string | null;
  bookingUrl: string | null;
  excerpt: string | null;
  searchText: string;
};

type FilterParams = {
  q: string;
  provider: string;
  category: string;
};

function includesNormalized(value: string | null | undefined, query: string): boolean {
  return String(value || "").toLowerCase().includes(query);
}

export function filterWorkouts(items: WorkoutBrowseRecord[], params: FilterParams): WorkoutBrowseRecord[] {
  const query = params.q.trim().toLowerCase();

  return items.filter((item) => {
    if (query && !includesNormalized(item.searchText, query)) return false;
    if (params.provider && item.provider !== params.provider) return false;
    if (params.category && item.category !== params.category) return false;
    return true;
  });
}

export function paginateWorkouts(items: WorkoutBrowseRecord[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    total: items.length,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}
