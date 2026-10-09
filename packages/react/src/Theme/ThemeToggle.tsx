import { RadioGroup, RadioGroupItem } from '../RadioGroup';
import { useTheme, type ThemeMode } from './ThemeProvider';

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode, forced, enableSystem } = useTheme();
  if (forced) return null; // light-only / dark-only products have nothing to choose

  return (
    <RadioGroup
      label="Theme"
      orientation="horizontal"
      value={mode}
      onValueChange={(v) => setMode(v as ThemeMode)}
      className={className}
    >
      <RadioGroupItem value="light" label="Light" />
      <RadioGroupItem value="dark" label="Dark" />
      {enableSystem && <RadioGroupItem value="system" label="System" />}
    </RadioGroup>
  );
}
