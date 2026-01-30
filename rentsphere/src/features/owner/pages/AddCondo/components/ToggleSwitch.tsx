type ToggleSwitchProps = {
  checked: boolean;
  onChange: () => void;
};

export default function ToggleSwitch({
  checked,
  onChange,
}: ToggleSwitchProps) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider" />
    </label>
  );
}
