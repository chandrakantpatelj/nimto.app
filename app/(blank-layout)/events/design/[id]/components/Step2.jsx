import React from 'react';

function Step2() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 overflow-auto p-8"></main>
      <aside className="w-130 flex-shrink-0 bg-white p-4 border-l border-slate-200 overflow-y-auto min-h-[calc(100vh-var(--header-height))] h-100">
        <div className="space-y-6">
          <h3 className="font-semibold text-lg mb-2 border-b pb-2">
            Canvas Settings
          </h3>
        </div>
      </aside>
    </div>
  );
}

export default Step2;
