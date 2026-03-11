import OwnerShell from "@/features/owner/components/OwnerShell";
import Step_4 from "@/features/owner/pages/AddCondo/steps/Step_4";
import { useSearchParams } from "react-router-dom";

export default function SettingStep4Page() {
    const [searchParams] = useSearchParams();
    const condoId = searchParams.get("condoId") ?? "";

    return (
        <OwnerShell
            activeKey="setting-step-4"
            condoId={condoId}
            showSidebar={true}
        >
            <Step_4 />
        </OwnerShell>
    );
}