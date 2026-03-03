import { Outlet } from "react-router-dom";
import OwnerShell from "@/features/owner/components/OwnerShell";

export default function OwnerSettingsLayout() {
    return (
        <OwnerShell activeKey="settings">
            <div className="owner-ui font-sans text-black/85">
                <Outlet />
            </div>
        </OwnerShell>
    );
}
