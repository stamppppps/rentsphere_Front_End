import OwnerShell from "@/features/owner/components/OwnerShell";
import Step_0 from "@/features/owner/pages/AddCondo/steps/Step_0";
import { useLocation, useSearchParams } from "react-router-dom";

type LocationState = {
    condoId?: string;
    condoName?: string;
} | null;

export default function SettingStep0Page() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const state = (location.state ?? null) as LocationState;

    const condoId = searchParams.get("condoId") ?? state?.condoId ?? undefined;
    const condoName =
        searchParams.get("condoName") ?? state?.condoName ?? "คอนโดมิเนียม";

    return (
        <OwnerShell
            title="ตั้งค่าคอนโด"
            activeKey="setting-step-0"
            condoId={condoId}
            condoName={condoName}
            showSidebar={true}
        >
            <Step_0 />
        </OwnerShell>
    );
}