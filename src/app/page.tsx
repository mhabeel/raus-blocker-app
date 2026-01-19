import BlockersPageClient from "./BlockersPageClient";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl text-black font-semibold tracking-tight">
            Vacation Blockers
          </h1>
          <p className="mt-2 text-gray-600">
            Manage periods when the property should not be bookable.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-gray-700 shadow-sm ring-1 ring-gray-200">
            <span className="font-medium">Property</span>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono">
              DEVTEST
            </span>
          </div>
        </header>

        <div className="grid gap-6">
          <BlockersPageClient />
        </div>

        <footer className="mt-10 text-sm text-gray-500">
          Raus Blockers System.
        </footer>
      </div>
    </main>
  );
}
