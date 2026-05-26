export function PrivacyChecklist() {
  return (
    <section className="rounded-md border border-brand-purple/20 bg-brand-surface p-5 shadow-brand-purple">
      <h2 className="text-lg font-semibold text-brand-text-main">MVP safety checks</h2>
      <div className="mt-4 grid gap-3 text-sm text-brand-text-muted md:grid-cols-3">
        <p className="rounded border border-brand-purple/20 bg-black p-3">
          Files are read through browser APIs and processed with Canvas.
        </p>
        <p className="rounded border border-brand-purple/20 bg-black p-3">
          Exports are generated with local Blob URLs and downloaded directly.
        </p>
        <p className="rounded border border-brand-purple/20 bg-black p-3">
          The app does not define upload routes or external processing calls.
        </p>
      </div>
    </section>
  );
}
