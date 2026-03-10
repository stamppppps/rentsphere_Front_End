import OwnerShell from "@/features/owner/components/OwnerShell";
import Step_8 from "@/features/owner/pages/AddCondo/steps/Step8_RoomService";
import { useSearchParams } from "react-router-dom";

export default function SettingStep8Page() {
    const [searchParams] = useSearchParams();
    const condoId = searchParams.get("condoId") ?? "";

    return (
        <OwnerShell
            activeKey="setting-step-8"
            condoId={condoId}
            showSidebar={true}
        >
            <Step_8 />
        </OwnerShell>
    );
}