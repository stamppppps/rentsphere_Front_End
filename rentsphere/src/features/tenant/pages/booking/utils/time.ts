export function getSlotDisplayStatus(timeRange: string) {
    const now = new Date();

    const [start, end] = timeRange.split(" - ");

    const today = new Date();

    const startTime = new Date(today);
    const [sh, sm] = start.split(":");
    startTime.setHours(Number(sh), Number(sm), 0);

    const endTime = new Date(today);
    const [eh, em] = end.split(":");
    endTime.setHours(Number(eh), Number(em), 0);

    if (now < startTime) {
        return "จองแล้ว";
    }

    if (now >= startTime && now <= endTime) {
        return "กำลังใช้งาน";
    }

    return "เสร็จสิ้น";
}