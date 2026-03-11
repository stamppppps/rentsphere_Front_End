import OwnerShell from "@/features/owner/components/OwnerShell";
import Step_2 from "@/features/owner/pages/AddCondo/steps/Step_2";
import { useSearchParams } from "react-router-dom";

export default function SettingStep2Page() {
    const [searchParams] = useSearchParams();
    const condoId = searchParams.get("condoId") ?? "";

    return (
        <OwnerShell
            activeKey="setting-step-2"
            condoId={condoId}
            showSidebar={true}
        >
            <Step_2 />
        </OwnerShell>
    );
}