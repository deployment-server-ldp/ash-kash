function buildHref(searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}

export function Pagination({
  page,
  pageCount,
  searchParams,
}: {
  page: number;
  pageCount: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <a href={buildHref(searchParams, page - 1)} className="btn-ghost">
          Previous
        </a>
      ) : null}
      {Array.from({ length: pageCount }).map((_, i) => {
        const p = i + 1;
        return (
          <a
            key={p}
            href={buildHref(searchParams, p)}
            className={`flex h-9 w-9 items-center justify-center text-sm ${p === page ? "bg-noir text-ivory" : "hover:bg-stone"}`}
          >
            {p}
          </a>
        );
      })}
      {page < pageCount ? (
        <a href={buildHref(searchParams, page + 1)} className="btn-ghost">
          Next
        </a>
      ) : null}
    </nav>
  );
}
