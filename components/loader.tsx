"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="p-8">
      <Skeleton className="h-[500px] w-full rounded-xl" />
    </div>
  );
}