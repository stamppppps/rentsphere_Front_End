
/**
 * Single Source of Truth for all UI Strings
 * Used to ensure consistent tone and professional language across the entire application.
 */
export const UI_TEXT = {
  COMMON: {
    SAVE: 'บันทึกข้อมูล',
    CANCEL: 'ยกเลิก',
    CONFIRM: 'ยืนยัน',
    BACK: 'ย้อนกลับ',
    CLOSE: 'ปิด',
    EDIT: 'แก้ไข',
    DELETE: 'ลบ',
    LOADING: 'กำลังโหลดข้อมูล...',
    SEARCH: 'ค้นหา...',
    ALL: 'ทั้งหมด',
    ACTION_REQUIRED: 'ต้องดำเนินการ',
    SUCCESS: 'ทำรายการสำเร็จ',
    ERROR: 'เกิดข้อผิดพลาด',
    RETRY: 'ลองอีกครั้ง',
    VIEW_DETAILS: 'ดูรายละเอียด'
  },
  FACILITY: {
    TITLE_LIST: 'พื้นที่ส่วนกลาง',
    TITLE_DETAIL: 'รายละเอียดพื้นที่',
    CREATE_TITLE: 'เพิ่มพื้นที่ส่วนกลาง',
    EDIT_TITLE: 'แก้ไขข้อมูลพื้นที่',
    CAPACITY: 'ความจุสูงสุด',
    OPEN_TIME: 'เวลาเปิด-ปิด',
    AUTO_APPROVE: 'ระบบอนุมัติอัตโนมัติ',
    STATUS_AVAILABLE: 'พร้อมให้บริการ',
    STATUS_MAINTENANCE: 'ปิดปรับปรุง',
    STATUS_CLOSED: 'ปิดชั่วคราว',
    TAGS: 'แท็ก / หมวดหมู่',
    CONFIG_TITLE: 'ตั้งค่าพื้นที่ส่วนกลาง',
    CONFIG_DESC: 'จัดการกฎเกณฑ์และสิทธิ์การใช้งานรายพื้นที่'
  },
  BOOKING: {
    TITLE_HISTORY: 'ประวัติการจองทั้งหมด',
    TITLE_DETAIL: 'รายละเอียดการจอง',
    PENDING_HEADER: 'คำขอที่รอการอนุมัติ',
    USER_INFO: 'ข้อมูลผู้ใช้งาน / ผู้จอง',
    DATE_TIME: 'วันที่และเวลาเข้าใช้งาน',
    PARTICIPANTS: 'จำนวนผู้ใช้งาน (ท่าน)',
    REASON: 'หมายเหตุ / วัตถุประสงค์',
    GRACE_PERIOD_INFO: 'ระยะเวลาผ่อนปรน (Grace Period) 15 นาที',
    TIMELINE: 'ลำดับเหตุการณ์ (Timeline)',
    UNIT_NUMBER: 'เลขที่ห้อง / ยูนิต',
    CREATED_AT: 'สร้างเมื่อ'
  },
  EMPTY_STATE: {
    FACILITY_TITLE: 'ไม่พบข้อมูลพื้นที่',
    FACILITY_DESC: 'ลองเปลี่ยนคำค้นหาหรือประเภทพื้นที่เพื่อให้แสดงผลลัพธ์อื่นที่ต้องการ',
    BOOKING_TITLE: 'ยังไม่มีรายการจองในขณะนี้',
    BOOKING_DESC: 'ขณะนี้ยังไม่มีลูกบ้านทำรายการจองพื้นที่เข้ามา ระบบกำลังรอรายการใหม่จากลูกบ้าน',
    HISTORY_TITLE: 'ไม่พบประวัติการใช้งาน',
    HISTORY_DESC: 'ไม่พบรายการที่ตรงกับตัวกรองที่เลือก ลองปรับเปลี่ยนช่วงเวลาหรือสถานะอีกครั้ง'
  },
  MODAL: {
    CONFIRM_APPROVE_TITLE: 'ยืนยันการอนุมัติการจอง?',
    CONFIRM_APPROVE_DESC: 'คุณได้ตรวจสอบข้อมูลและความถูกต้องของรายการนี้เรียบร้อยแล้วใช่หรือไม่',
    CONFIRM_REJECT_TITLE: 'ยืนยันการปฏิเสธคำขอ?',
    CONFIRM_REJECT_DESC: 'โปรดระบุเหตุผลที่ชัดเจนในการปฏิเสธ เพื่อแจ้งให้ลูกบ้านทราบ',
    CONFIRM_LATE_TITLE: 'บันทึกการเช็คอินสาย (Late)',
    CONFIRM_LATE_DESC: 'ลูกบ้านมาสายเกินระยะเวลาผ่อนปรน แต่แอดมินอนุญาตให้เข้าใช้งานพื้นที่ได้',
    CONFIRM_NOSHOW_TITLE: 'บันทึกการไม่ปรากฏตัว (No-Show)',
    CONFIRM_NOSHOW_DESC: 'การบันทึก No-Show จะส่งผลต่อประวัติพฤติกรรมและการจองในอนาคตของลูกบ้าน',
    CONFIRM_CANCEL_TITLE: 'ยืนยันการยกเลิกการจอง?',
    CONFIRM_CANCEL_DESC: 'เมื่อยกเลิกแล้ว รายการนี้จะถูกลบออกจากตารางเวลา และไม่สามารถกู้คืนได้',
    CONFIRM_COMPLETE_TITLE: 'ยืนยันการเช็คอิน / เสร็จสิ้น?',
    CONFIRM_COMPLETE_DESC: 'บันทึกว่าลูกบ้านได้เข้าใช้งานและออกจากพื้นที่เรียบร้อยแล้ว'
  }
};
