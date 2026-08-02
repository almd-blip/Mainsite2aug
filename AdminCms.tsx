import React, { useEffect, useMemo, useState } from 'react';
import { CMS_DEFAULT_VALUES, CMS_GROUPS } from './cmsSchema';

const flattenFields = () => CMS_GROUPS.flatMap((group) => group.fields);

export default function AdminCms() {
  const [values, setValues] = useState<Record<string, string>>(CMS_DEFAULT_VALUES);
  const [statusMessage, setStatusMessage] = useState('Loading saved content...');
  const [isSaving, setIsSaving] = useState(false);
  const fields = useMemo(flattenFields, []);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/cms/content', { headers: { Accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : {})
      .then((data: any) => {
        if (!isMounted) return;
        const savedValues = data?.values && typeof data.values === 'object' ? data.values : data;
        setValues({
          ...CMS_DEFAULT_VALUES,
          ...Object.fromEntries(Object.entries(savedValues || {}).filter(([, value]) => typeof value === 'string'))
        });
        setStatusMessage('Ready to edit.');
      })
      .catch(() => {
        if (!isMounted) return;
        setValues(CMS_DEFAULT_VALUES);
        setStatusMessage('Using default content. Saving requires the Cloudflare CMS binding.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateValue = (key: string, nextValue: string) => {
    setValues((prev) => ({ ...prev, [key]: nextValue }));
  };

  const restoreDefaults = () => {
    setValues(CMS_DEFAULT_VALUES);
    setStatusMessage('Defaults loaded. Save changes to publish defaults.');
  };

  const save = async () => {
    setIsSaving(true);
    setStatusMessage('Saving...');
    try {
      const response = await fetch('/api/cms/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || `Save failed with status ${response.status}`);
      }

      setStatusMessage('Saved. Refresh the public site to see changes.');
    } catch (err: any) {
      setStatusMessage(err?.message || 'Save failed. Check Cloudflare Access and KV setup.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#1B0A3B] p-6 sm:p-10 text-left" id="cms-admin-root">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2 border-b border-[#1B0A3B]/15 pb-5">
          <p className="text-xs font-semibold opacity-70">Second Thought mini CMS</p>
          <h1 className="text-3xl font-bold tracking-tight">Edit website text</h1>
          <p className="text-sm leading-relaxed opacity-85 max-w-3xl">
            Edit text in the form fields below, then save. If a field is left blank, the public site will show the blank field after saving.
            Use Restore default text if you want to load the original wording back into the form.
          </p>
        </header>

        <div className="sticky top-0 z-10 border border-[#1B0A3B]/15 rounded-2xl p-4 bg-[#faf8f5]/95 backdrop-blur flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-sm font-semibold" aria-live="polite">{statusMessage}</p>
          <div className="flex flex-wrap gap-2">
            <a href="/" className="px-4 py-2 rounded-xl border border-[#1B0A3B]/20 text-sm font-semibold hover:bg-[#1B0A3B]/5">
              Preview public site
            </a>
            <button type="button" onClick={restoreDefaults} className="px-4 py-2 rounded-xl border border-[#1B0A3B]/20 text-sm font-semibold hover:bg-[#1B0A3B]/5">
              Restore default text
            </button>
            <button type="button" onClick={save} disabled={isSaving} className="px-4 py-2 rounded-xl bg-[#1B0A3B] text-white text-sm font-semibold disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        <section className="space-y-4">
          {CMS_GROUPS.map((group) => (
            <details key={group.id} className="border border-[#1B0A3B]/15 rounded-2xl bg-white/60 overflow-hidden" open={['arrival', 'choice', 'ready'].includes(group.id)}>
              <summary className="cursor-pointer px-5 py-4 font-bold text-lg border-b border-[#1B0A3B]/10">
                {group.title}
              </summary>
              <div className="p-5 space-y-5">
                {group.description && (
                  <p className="text-sm opacity-80 leading-relaxed">{group.description}</p>
                )}
                {group.fields.map((field) => (
                  <label key={field.key} className="block space-y-1.5">
                    <span className="text-sm font-semibold">{field.label}</span>
                    {field.type === 'longText' ? (
                      <textarea
                        value={values[field.key] ?? ''}
                        onChange={(event) => updateValue(field.key, event.target.value)}
                        rows={5}
                        className="w-full rounded-xl border border-[#1B0A3B]/20 bg-white p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1B0A3B]"
                      />
                    ) : (
                      <input
                        value={values[field.key] ?? ''}
                        onChange={(event) => updateValue(field.key, event.target.value)}
                        className="w-full rounded-xl border border-[#1B0A3B]/20 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B0A3B]"
                      />
                    )}
                    <span className="block text-[11px] opacity-55">Key: {field.key}</span>
                  </label>
                ))}
              </div>
            </details>
          ))}
        </section>
      </div>
    </main>
  );
}
