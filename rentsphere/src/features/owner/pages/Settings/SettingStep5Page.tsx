import OwnerShell from "@/features/owner/components/OwnerShell";
import Step_5 from "@/features/owner/pages/AddCondo/steps/Step_5";
import { useSearchParams } from "react-router-dom";

export default function SettingStep5Page() {
    const [searchParams] = useSearchParams();
    const condoId = searchParams.get("condoId") ?? "";

    return (
        <OwnerShell
            activeKey="setting-step-5"
            condoId={condoId}
            showSidebar={true}
        >
            <Step_5 />
        </OwnerShell>
    );
}