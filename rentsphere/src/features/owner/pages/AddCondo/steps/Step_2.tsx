import React, { useState } from 'react';
import UtilitySetupCard from '../components/UtilitySetupCard';
import UtilityConfigModal from '../components/UtilityConfigModal';
import Button from '../components/Button';

type UtilityType = 'water' | 'electricity';

const WaterIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_101_2)">
      <path d="M50 8C26.8 8 8 28.1 8 50.5C8 71.5 35.7 92 50 92C64.3 92 92 71.5 92 50.5C92 28.1 73.2 8 50 8Z" fill="url(#paint0_linear_101_2)"/>
    </g>
    <path d="M50 22C38.4 22 29 31.9 29 42.7C29 52.9 44.28 68 50 68C55.72 68 71 52.9 71 42.7C71 31.9 61.6 22 50 22Z" fill="white" fillOpacity="0.5"/>
    <defs>
      <filter id="filter0_d_101_2" x="0" y="0" width="100" height="100" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset/>
        <feGaussianBlur stdDeviation="4"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.490196 0 0 0 0 0.701961 0 0 0 0 0.933333 0 0 0 0.5 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_101_2"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_101_2" result="shape"/>
      </filter>
      <linearGradient id="paint0_linear_101_2" x1="50" y1="8" x2="50" y2="92" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A8B5FF"/>
        <stop offset="1" stopColor="#818CF8"/>
      </linearGradient>
    </defs>
  </svg>
);

const ElectricityIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_101_3)">
      <path d="M50 8C26.8 8 8 28.1 8 50.5C8 71.5 35.7 92 50 92C64.3 92 92 71.5 92 50.5C92 28.1 73.2 8 50 8Z" fill="url(#paint0_linear_101_3)"/>
    </g>
    <path d="M57.5 29L40 50.6H51L45.5 67L63 43.4H52L57.5 29Z" fill="white" fillOpacity="0.7"/>
    <defs>
      <filter id="filter0_d_101_3" x="0" y="0" width="100" height="100" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset/>
        <feGaussianBlur stdDeviation="4"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.988235 0 0 0 0 0.8 0 0 0 0 0.564706 0 0 0 0.5 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_101_3"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_101_3" result="shape"/>
      </filter>
      <linearGradient id="paint0_linear_101_3" x1="50" y1="8" x2="50" y2="92" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDBA74"/>
        <stop offset="1" stopColor="#FB923C"/>
      </linearGradient>
    </defs>
  </svg>
);

const Step_2: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [currentUtility, setCurrentUtility] = useState<UtilityType | null>(null);

    const handleOpenModal = (utility: UtilityType) => {
        setCurrentUtility(utility);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentUtility(null);
    };
    
    const handleSave = (config: any) => {
        console.log("Saving config:", { utility: currentUtility, ...config });
        handleCloseModal();
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">ตั้งค่าคอนโดมิเนียม</h1>

            <div className="bg-white/70 backdrop-blur-sm p-5 rounded-lg border border-violet-200">
                <h3 className="font-bold text-violet-800 mb-2">การกำหนดค่าน้ำค่าไฟมี 3 รูปแบบ</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>คิดตามหน่วยจริงจากมิเตอร์</li>
                    <li>คิดตามหน่วยจริงแบบมีขั้นต่ำ</li>
                    <li>คิดแบบเหมาจ่ายรายเดือน</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-violet-100">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <UtilitySetupCard 
                        icon={<WaterIcon />}
                        onConfigure={() => handleOpenModal('water')}
                        buttonText="ระบุการคิดค่าน้ำ"
                    />
                     <UtilitySetupCard 
                        icon={<ElectricityIcon />}
                        onConfigure={() => handleOpenModal('electricity')}
                        buttonText="ระบุการคิดค่าไฟ"
                    />
                </div>
            </div>
            
            <div className="flex justify-end">
                <Button>ต่อไป</Button>
            </div>

            <UtilityConfigModal 
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                utilityType={currentUtility}
            />
        </div>
    );
};

export default Step_2;
