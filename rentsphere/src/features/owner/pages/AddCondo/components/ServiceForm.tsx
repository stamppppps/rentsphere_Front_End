import React, { useState } from 'react';
import Select from './Select';
import Input from './Input';
import Checkbox from './Checkbox';
import Button from './Button';

interface ServiceFormProps {
  onAddService: (serviceName: string, price: number, isVariable: boolean) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onAddService }) => {
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [isVariable, setIsVariable] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !price) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    onAddService(serviceName, parseFloat(price), isVariable);
    setServiceName('');
    setPrice('');
    setIsVariable(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Select
          id="serviceName"
          label="ชื่อค่าบริการ"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          required
        >
          <option value="" disabled>สามารถเลือกจากรายการที่มี</option>
          <option value="ค่าอินเตอร์เน็ต">ค่าอินเตอร์เน็ต</option>
          <option value="ค่าฟิตเนส">ค่าฟิตเนส</option>
          <option value="ค่าที่จอดรถ">ค่าที่จอดรถ</option>
          <option value="ค่าส่วนกลาง">ค่าส่วนกลาง</option>
        </Select>
        <Input
          id="price"
          label="ราคาต่อหน่วย"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          suffix="บาท"
          required
        />
      </div>
      
      <Checkbox
        id="isVariable"
        label="ประเภทแปรผันตามมิเตอร์"
        checked={isVariable}
        onChange={(e) => setIsVariable(e.target.checked)}
      />

      <div className="flex justify-end pt-4">
        <Button type="submit">
          เพิ่ม
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
