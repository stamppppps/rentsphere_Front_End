import { useNavigate } from "react-router-dom";

type OwnerMenuProps = {
    condoName?: string;
    ownerName?: string;
    showBrand?: boolean;
};

export default function OwnerMenu({
    condoName = "คอนโดมิเนียม",
    ownerName = "Mr. Kittidet Suksarn",
    showBrand = true,
}: OwnerMenuProps) {
    const nav = useNavigate();

    return (
        <div className="relative flex items-center h-full w-full">

            {/* ===== CENTER : CONDO NAME ===== */}
            <div className="absolute left-1/2 -translate-x-1/2">
                <div className="text-base font-extrabold text-gray-700">
                    {condoName}
                </div>
            </div>

            {/* ===== RIGHT : USER ===== */}
            <div className="ml-auto flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-sm font-black text-blue-600">
                    K
                </div>
                <div className="hidden sm:block text-sm font-bold text-gray-700">
                    {ownerName}
                </div>
            </div>
        </div>
    );
}
