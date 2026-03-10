import OwnerShell from "@/features/owner/components/OwnerShell";
import Step_1 from "@/features/owner/pages/AddCondo/steps/Step_1";
import { useSearchParams } from "react-router-dom";

export default function SettingStep1Page() {
    const [searchParams] = useSearchParams();
    const condoId = searchParams.get("condoId") ?? "";

    return (
        <OwnerShell
            activeKey="setting-step-1"
            condoId={condoId}
            showSidebar={true}
        >
            <Step_1 />
        </OwnerShell>
    );
}