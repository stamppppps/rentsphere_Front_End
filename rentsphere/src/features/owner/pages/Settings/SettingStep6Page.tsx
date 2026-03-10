import OwnerShell from "@/features/owner/components/OwnerShell";
import Step_6 from "@/features/owner/pages/AddCondo/steps/Step6_RoomPrice";
import { useSearchParams } from "react-router-dom";

export default function SettingStep6Page() {
    const [searchParams] = useSearchParams();
    const condoId = searchParams.get("condoId") ?? "";

    return (
        <OwnerShell
            activeKey="setting-step-6"
            condoId={condoId}
            showSidebar={true}
        >
            <Step_6 />
        </OwnerShell>
    );
}