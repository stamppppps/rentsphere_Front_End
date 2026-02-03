import OwnerMenu from "@/features/owner/components/ownerMenu";
import Sidebar from "@/features/owner/components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";

export default function CondoLayout() {
    const { pathname } = useLocation();

    const hideSidebar =
        pathname === "/owner/condo" || pathname === "/owner/condo/";

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#eef5ff] font-sarabun">
            {/* ===== TOP BAR  ===== */}
            <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] border border-blue-100/60 overflow-hidden mx-auto w-full max-w-6xl mt-8">
                <div className="px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/60">
                    <OwnerMenu />
                </div>
            </div>

            {/* ===== BODY ===== */}
            <div className="mx-auto w-full max-w-6xl mt-6 pb-10">
                {hideSidebar ? (
                    <Outlet />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                        {/* sidebar */}
                        <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] border border-blue-100/60 overflow-hidden">
                            <div className="px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/60">
                                <div className="text-xl font-extrabold text-gray-900">คอนโดมิเนียม</div>
                            </div>
                            <div className="p-5">
                                <Sidebar />
                            </div>
                        </div>

                        {/* content */}
                        <div className="min-w-0">
                            <Outlet />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
