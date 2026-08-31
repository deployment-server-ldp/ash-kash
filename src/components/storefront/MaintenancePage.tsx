export function MaintenancePage({ storeName, message }: { storeName: string; message: string | null }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
      <h1 className="font-display text-3xl tracking-wide sm:text-4xl">{storeName}</h1>
      <p className="mt-4 eyebrow">Site Under Development</p>
      <p className="mt-4 max-w-md text-noir/60">
        {message ?? "We're putting the finishing touches on something beautiful. Please check back soon."}
      </p>
    </div>
  );
}
