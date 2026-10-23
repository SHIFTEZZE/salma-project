export function SkeletonProduct() {
  return (
    <div className="card-premium overflow-hidden">
      <div className="aspect-[3/4] w-full skeleton" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-1/3 skeleton rounded" />
        <div className="h-6 w-3/4 skeleton rounded" />
        <div className="h-5 w-1/2 skeleton rounded mt-4" />
      </div>
    </div>
  );
}
