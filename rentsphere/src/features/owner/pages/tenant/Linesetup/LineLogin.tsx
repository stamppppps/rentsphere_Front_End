import React from "react";

const LineLogin: React.FC = () => {
  const onLogin = () => {
    window.location.href = "http://localhost:3001/auth/line/login";
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#D2E8FF] p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-black mb-2">สมัคร / เข้าสู่ระบบ</h1>
        <p className="text-sm text-gray-600 mb-6">
          เข้าสู่ระบบด้วย LINE เพื่อบันทึกข้อมูลผู้ใช้ลงระบบ
        </p>

        <button
          onClick={onLogin}
          className="w-full  text-black font-bold py-3 rounded-2xl"
        >
          เข้าสู่ระบบด้วย LINE  
        </button>
      </div>
    </div>
  );
};

export default LineLogin;
