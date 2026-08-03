import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Search, Globe, Flag } from 'lucide-react';
import {
  Combobox,
  ComboboxInput,
  ComboboxTags,
  ComboboxContent,
  ComboboxItem,
  ComboboxGroup,
  ComboboxEmpty,
} from './index';

const meta: Meta<typeof Combobox> = { title: 'Components/Combobox', component: Combobox };
export default meta;
type Story = StoryObj<typeof Combobox>;

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];

export const Default: Story = {
  render: function DefaultExample() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <Combobox value={value} onValueChange={(v) => setValue(v as string)} className="w-72">
        <ComboboxInput placeholder="Select a fruit..." />
        <ComboboxContent>
          <ComboboxEmpty />
          {FRUITS.map((fruit) => (
            <ComboboxItem key={fruit} value={fruit}>
              {fruit}
            </ComboboxItem>
          ))}
        </ComboboxContent>
      </Combobox>
    );
  },
};

export const Multiple: Story = {
  render: function MultipleExample() {
    const [value, setValue] = useState<string[]>(['Apple', 'Cherry']);
    return (
      <div className="w-80">
        <Combobox multiple value={value} onValueChange={(v) => setValue(v as string[])}>
          <ComboboxInput placeholder="Add fruits..." />
          <ComboboxContent>
            <ComboboxEmpty />
            {FRUITS.map((fruit) => (
              <ComboboxItem key={fruit} value={fruit}>
                {fruit}
              </ComboboxItem>
            ))}
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};

export const ClearButton: Story = {
  render: function ClearButtonExample() {
    const [value, setValue] = useState<string | undefined>('Banana');
    return (
      <div className="w-72">
        <Combobox value={value} onValueChange={(v) => setValue(v as string)}>
          <ComboboxInput placeholder="Select a fruit..." showClearButton />
          <ComboboxContent>
            <ComboboxEmpty />
            {FRUITS.map((fruit) => (
              <ComboboxItem key={fruit} value={fruit}>
                {fruit}
              </ComboboxItem>
            ))}
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};

export const Groups: Story = {
  render: function GroupsExample() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div className="w-72">
        <Combobox value={value} onValueChange={(v) => setValue(v as string)}>
          <ComboboxInput placeholder="Select a timezone..." />
          <ComboboxContent>
            <ComboboxEmpty />
            <ComboboxGroup heading="Americas">
              <ComboboxItem value="est">Eastern Time</ComboboxItem>
              <ComboboxItem value="cst">Central Time</ComboboxItem>
              <ComboboxItem value="pst">Pacific Time</ComboboxItem>
            </ComboboxGroup>
            <ComboboxGroup heading="Europe">
              <ComboboxItem value="gmt">London (GMT)</ComboboxItem>
              <ComboboxItem value="cet">Paris (CET)</ComboboxItem>
            </ComboboxGroup>
            <ComboboxGroup heading="Asia">
              <ComboboxItem value="ist">Kolkata (IST)</ComboboxItem>
              <ComboboxItem value="jst">Tokyo (JST)</ComboboxItem>
            </ComboboxGroup>
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};

const COUNTRIES = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
];

export const CustomItems: Story = {
  render: function CustomItemsExample() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div className="w-80">
        <Combobox value={value} onValueChange={(v) => setValue(v as string)}>
          <ComboboxInput placeholder="Select a country..." leading={<Globe size={16} />} />
          <ComboboxContent>
            <ComboboxEmpty />
            {COUNTRIES.map((country) => (
              <ComboboxItem key={country.code} value={country.code} textValue={country.name}>
                <span className="flex items-center gap-2">
                  <span aria-hidden="true">{country.flag}</span>
                  <span className="flex flex-col">
                    <span>{country.name}</span>
                    <span className="text-text-secondary text-xs">
                      {country.code.toUpperCase()}
                    </span>
                  </span>
                </span>
              </ComboboxItem>
            ))}
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};

export const Invalid: Story = {
  render: function InvalidExample() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div className="w-72 space-y-1">
        <Combobox value={value} onValueChange={(v) => setValue(v as string)} invalid>
          <ComboboxInput placeholder="Select a fruit..." />
          <ComboboxContent>
            <ComboboxEmpty />
            {FRUITS.map((fruit) => (
              <ComboboxItem key={fruit} value={fruit}>
                {fruit}
              </ComboboxItem>
            ))}
          </ComboboxContent>
        </Combobox>
        <p className="text-danger-default text-xs">Please select a valid fruit.</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-72">
      <Combobox disabled value="Apple">
        <ComboboxInput placeholder="Select a fruit..." />
        <ComboboxContent>
          {FRUITS.map((fruit) => (
            <ComboboxItem key={fruit} value={fruit}>
              {fruit}
            </ComboboxItem>
          ))}
        </ComboboxContent>
      </Combobox>
    </div>
  ),
};

export const AutoHighlight: Story = {
  render: function AutoHighlightExample() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div className="w-72 space-y-2">
        <p className="text-text-secondary text-sm">
          The first matching item is automatically highlighted as you type — press Enter to select
          it immediately.
        </p>
        <Combobox value={value} onValueChange={(v) => setValue(v as string)} autoHighlight>
          <ComboboxInput placeholder="Try typing 'a'..." />
          <ComboboxContent>
            <ComboboxEmpty />
            {FRUITS.map((fruit) => (
              <ComboboxItem key={fruit} value={fruit}>
                {fruit}
              </ComboboxItem>
            ))}
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};

export const Popup: Story = {
  render: function PopupExample() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div className="flex h-64 w-72 items-end">
        <Combobox value={value} onValueChange={(v) => setValue(v as string)} className="w-full">
          <ComboboxInput placeholder="Popup positions above/below..." />
          <ComboboxContent>
            <ComboboxEmpty />
            {FRUITS.map((fruit) => (
              <ComboboxItem key={fruit} value={fruit}>
                {fruit}
              </ComboboxItem>
            ))}
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};

export const InputGroup: Story = {
  render: function InputGroupExample() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div className="w-72">
        <Combobox value={value} onValueChange={(v) => setValue(v as string)}>
          <ComboboxInput placeholder="Search fruits..." leading={<Search size={16} />} />
          <ComboboxContent>
            <ComboboxEmpty />
            {FRUITS.map((fruit) => (
              <ComboboxItem key={fruit} value={fruit}>
                {fruit}
              </ComboboxItem>
            ))}
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};

const FRUITS_AR = ['تفاح', 'موز', 'كرز', 'تمر', 'توت', 'تين', 'عنب'];

export const RTL: Story = {
  render: function RTLExample() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div dir="rtl" className="w-72">
        <Combobox value={value} onValueChange={(v) => setValue(v as string)}>
          <ComboboxInput placeholder="اختر فاكهة..." leading={<Flag size={16} />} />
          <ComboboxContent>
            <ComboboxEmpty />
            {FRUITS_AR.map((fruit) => (
              <ComboboxItem key={fruit} value={fruit}>
                {fruit}
              </ComboboxItem>
            ))}
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};
