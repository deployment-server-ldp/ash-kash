import type { Category, Color, Size } from "@prisma/client";

export function FilterForm({
  sizes,
  colors,
  categories,
  hideCategory,
  searchParams,
}: {
  sizes: Size[];
  colors: Color[];
  categories: Category[];
  hideCategory?: boolean;
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <form method="get" className="space-y-8">
      {!hideCategory ? (
        <div>
          <p className="mb-3 text-xs uppercase tracking-wide2 text-noir/60">Category</p>
          <div className="space-y-2">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="category"
                  value={c.slug}
                  defaultChecked={searchParams.category === c.slug}
                  className="accent-clay-600"
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-3 text-xs uppercase tracking-wide2 text-noir/60">Price</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="min_price"
            placeholder="Min"
            defaultValue={searchParams.min_price}
            className="input px-2 py-1.5 text-sm"
          />
          <span className="text-noir/40">–</span>
          <input
            type="number"
            name="max_price"
            placeholder="Max"
            defaultValue={searchParams.max_price}
            className="input px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {sizes.length > 0 ? (
        <div>
          <p className="mb-3 text-xs uppercase tracking-wide2 text-noir/60">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <label key={s.id}>
                <input type="radio" name="size" value={s.name} defaultChecked={searchParams.size === s.name} className="peer sr-only" />
                <span className="block cursor-pointer border border-stone px-3 py-1.5 text-sm peer-checked:border-noir peer-checked:bg-noir peer-checked:text-ivory">
                  {s.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {colors.length > 0 ? (
        <div>
          <p className="mb-3 text-xs uppercase tracking-wide2 text-noir/60">Color</p>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => (
              <label key={c.id} title={c.name}>
                <input type="radio" name="color" value={c.name} defaultChecked={searchParams.color === c.name} className="peer sr-only" />
                <span
                  className="block h-7 w-7 cursor-pointer rounded-full border border-stone peer-checked:ring-2 peer-checked:ring-noir peer-checked:ring-offset-2"
                  style={{ backgroundColor: c.hexValue ?? "#ccc" }}
                />
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="in_stock" value="1" defaultChecked={searchParams.in_stock === "1"} className="accent-clay-600" />
          In Stock Only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="on_sale" value="1" defaultChecked={searchParams.on_sale === "1"} className="accent-clay-600" />
          On Sale
        </label>
      </div>

      {searchParams.sort ? <input type="hidden" name="sort" value={searchParams.sort} /> : null}
      {searchParams.q ? <input type="hidden" name="q" value={searchParams.q} /> : null}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">
          Apply Filters
        </button>
        <a href="?" className="btn-ghost">
          Clear
        </a>
      </div>
    </form>
  );
}
