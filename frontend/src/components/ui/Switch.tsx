interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}

const Switch = ({ checked, onCheckedChange, id }: SwitchProps) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`
      relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent
      transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
      ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}
    `}
  >
    <span
      className={`
        inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform
        ${checked ? 'translate-x-6' : 'translate-x-1'}
      `}
    />
  </button>
);

export default Switch;
