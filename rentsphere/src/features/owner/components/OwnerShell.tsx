import OwnerMenu from "@/features/owner/components/ownerMenu";
import Sidebar from "@/features/owner/components/Sidebar";
import type { ReactNode } from "react";

type OwnerShellProps = {
    title?: string;
    activeKey?: string;
    showSidebar?: boolean;
    children: ReactNode;
    footer?: ReactNode;
};

export default function OwnerShell({
    title,
    activeKey,
    showSidebar = true,
    children,
    footer,
}: OwnerShellProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#EEF4FF] font-sarabun">
            {/* Sidebar */}
            {showSidebar && (
                <aside
                    className={[
                        "w-[22rem] shrink-0 bg-[#D6E6FF]",
                        "border-r border-blue-100/80",
                        "shadow-[2px_0_14px_rgba(0,0,0,0.05)]",
                    ].join(" ")}
                >
                    <Sidebar activeKey={activeKey} />
                </aside>
            )}

            {/* Main */}
            <main className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
                <header className="h-20 shrink-0 bg-[#D6E6FF] border-b border-blue-100/80 flex items-center px-10 shadow-sm">
                    <OwnerMenu />
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 pb-28">
                    <div className="mx-auto w-full max-w-6xl">
                        {title ? (
                            <div className="mb-6 rounded-2xl border border-blue-200/60 bg-white/70 backdrop-blur-md shadow-[0_16px_40px_rgba(15,23,42,0.12)] overflow-hidden">
                                <div className="px-6 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
                                    <div className="text-center text-2xl font-extrabold text-gray-900">
                                        {title}
                                    </div>
                                </div>
                                <div className="p-6">{children}</div>
                            </div>
                        ) : (
                            children
                        )}
                    </div>
                </div>

                {/* Sticky footer (optional) */}
                {footer ? (
                    <div className="sticky bottom-0 w-full bg-[#EEF4FF]/90 backdrop-blur border-t border-blue-100/70">
                        <div className="mx-auto w-full max-w-6xl px-8 py-5 flex items-center justify-end gap-4">
                            {footer}
                        </div>
                    </div>
                ) : null}
            </main>
        </div>
    );
}
