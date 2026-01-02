import Breadcrumbs from "./Breadcrumbs";

export default function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-2">
      <Breadcrumbs />
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
    </div>
  );
}
