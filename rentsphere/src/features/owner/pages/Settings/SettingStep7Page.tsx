import OwnerShell from "@/features/owner/components/OwnerShell";
import Step_7 from "@/features/owner/pages/AddCondo/steps/Step7_Review";
import { useSearchParams } from "react-router-dom";

export default function SettingStep7Page() {
    const [searchParams] = useSearchParams();
    const condoId = searchParams.get("condoId") ?? "";

    return (
        <OwnerShell
            activeKey="setting-step-7"
            condoId={condoId}
            showSidebar={true}
        >
            <Step_7 />
        </OwnerShell>
    );
}