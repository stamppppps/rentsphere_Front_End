export type OwnerMenuItem = {
    key: string;
    label: string;
    path: string;
};

export const OWNER_MENU: OwnerMenuItem[] = [
    { key: "dashboard", label: "ข้อมูลภาพรวม", path: "/owner/dashboard" },
    { key: "rooms", label: "ห้อง", path: "/owner/rooms" },
    { key: "maintenance", label: "แจ้งซ่อม", path: "/owner/maintenance" },
    { key: "parcel", label: "แจ้งพัสดุ", path: "/owner/parcel" },
    { key: "common-area", label: "จองส่วนกลาง", path: "/owner/common-area-booking" },
    { key: "meter", label: "จดมิเตอร์", path: "/owner/meter" },
    { key: "billing", label: "ออกบิล", path: "/owner/billing" },
    { key: "payments", label: "แจ้งชำระเงิน", path: "/owner/payments" },
    { key: "reports", label: "รายงาน", path: "/owner/reports" },

];
