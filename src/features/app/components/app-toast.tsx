"use client";

import Toast from "@/components/arc/toast/toast";
import { useUiStore } from "@/features/app/stores/ui-store";

export default function AppToast() {
  const toast = useUiStore((state) => state.toast);
  const hideToast = useUiStore((state) => state.hideToast);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4 sm:justify-end sm:pr-6">
      <div className="pointer-events-auto">
        <Toast
          title={toast?.title ?? ""}
          description={toast?.description}
          open={toast !== null}
          onOpenChange={(open) => {
            if (!open) hideToast();
          }}
        />
      </div>
    </div>
  );
}
