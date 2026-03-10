import OwnerShell from "@/features/owner/components/OwnerShell";
import Step_3 from "@/features/owner/pages/AddCondo/steps/Step_3";
import { useSearchParams } from "react-router-dom";

export default function SettingStep3Page() {
    const [searchParams] = useSearchParams();
    const condoId = searchParams.get("condoId") ?? "";

    return (
        <OwnerShell
            activeKey="setting-step-3"
            condoId={condoId}
            showSidebar={true}
        >
            <Step_3 />
        </OwnerShell>
    );
}