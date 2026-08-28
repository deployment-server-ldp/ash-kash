export function EmptyHomepageState() {
  return (
    <div className="container-boutique flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-3xl">Welcome to your new store</h1>
      <p className="mt-3 max-w-md text-noir/60">
        No homepage sections are configured yet. Go to <strong>Admin → Content → Homepage</strong> to add a hero
        slider, featured products, and more.
      </p>
    </div>
  );
}
