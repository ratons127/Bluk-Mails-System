export default function JsonViewer({ data }: { data: unknown }) {
  return (
    <pre className="max-h-[400px] overflow-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
