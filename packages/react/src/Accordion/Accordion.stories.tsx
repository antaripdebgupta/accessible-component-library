import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './index';

const meta: Meta<typeof Accordion> = { title: 'Components/Accordion', component: Accordion };
export default meta;
type Story = StoryObj<typeof Accordion>;

function Items() {
  return (
    <>
      <AccordionItem value="a">
        <AccordionTrigger>What is this library?</AccordionTrigger>
        <AccordionContent>
          An accessible, production-grade component library built on ARIA APG patterns.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Is it WCAG 2.2 AA compliant?</AccordionTrigger>
        <AccordionContent>
          Yes — verified with axe-core, Playwright, and manual screen reader testing.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>How is it tested?</AccordionTrigger>
        <AccordionContent>
          Unit tests, Storybook interaction tests, and Playwright E2E across browsers.
        </AccordionContent>
      </AccordionItem>
    </>
  );
}

// Only the Disabled story includes a disabled item
function ItemsWithDisabled() {
  return (
    <>
      <AccordionItem value="a">
        <AccordionTrigger>What is this library?</AccordionTrigger>
        <AccordionContent>An accessible, production-grade component library.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b" disabled>
        <AccordionTrigger>Coming soon</AccordionTrigger>
        <AccordionContent>This item is disabled.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Is it WCAG 2.2 AA compliant?</AccordionTrigger>
        <AccordionContent>Yes — verified with axe-core and manual testing.</AccordionContent>
      </AccordionItem>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <Accordion type="single" defaultValue="a" className="w-96">
      <Items />
    </Accordion>
  ),
};
export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={['a', 'b']} className="w-96">
      <Items />
    </Accordion>
  ),
};
export const Disabled: Story = {
  render: () => (
    <Accordion type="single" defaultValue="a" className="w-96">
      <ItemsWithDisabled />
    </Accordion>
  ),
};
export const Border: Story = {
  render: () => (
    <Accordion type="single" variant="border" defaultValue="a" className="w-96">
      <Items />
    </Accordion>
  ),
};
export const Card: Story = {
  render: () => (
    <Accordion type="single" variant="card" defaultValue="a" className="w-96">
      <Items />
    </Accordion>
  ),
};

export const RTL: Story = {
  render: () => (
    <Accordion type="single" defaultValue="a" dir="rtl" className="w-96">
      <AccordionItem value="a">
        <AccordionTrigger>ما هذه المكتبة؟</AccordionTrigger>
        <AccordionContent>مكتبة مكونات يمكن الوصول إليها.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>هل تتوافق مع WCAG؟</AccordionTrigger>
        <AccordionContent>نعم، تم التحقق باستخدام axe-core.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
