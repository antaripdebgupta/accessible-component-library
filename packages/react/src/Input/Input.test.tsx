import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import jestAxe from 'jest-axe';
import { describe, expect, test, vi } from 'vitest';
import { Input, InputGroup, FieldGroup, FileInput } from './index';

const { axe, toHaveNoViolations } = jestAxe;
expect.extend(toHaveNoViolations);

describe('Input component', () => {
  test('renders native input with label association', () => {
    render(<Input label="Email address" type="email" placeholder="you@example.com" />);
    const input = screen.getByRole('textbox', { name: 'Email address' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  test('has no axe violations for standard variants', async () => {
    const { container: defaultView } = render(
      <Input label="Username" description="Choose a unique username." />,
    );
    expect(await axe(defaultView)).toHaveNoViolations();

    const { container: invalidView } = render(
      <Input label="Username" error="Username is already taken." />,
    );
    expect(await axe(invalidView)).toHaveNoViolations();

    const { container: disabledView } = render(
      <Input label="Username" disabled value="john_doe" />,
    );
    expect(await axe(disabledView)).toHaveNoViolations();

    const { container: requiredView } = render(
      <Input label="Password" type="password" required showRequiredIndicator />,
    );
    expect(await axe(requiredView)).toHaveNoViolations();
  });

  test('combines helper description and error in aria-describedby', () => {
    render(
      <Input
        label="Phone Number"
        description="Include country code."
        error="Invalid phone number format."
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Phone Number' });
    const describedBy = input.getAttribute('aria-describedby') || '';

    expect(describedBy).toContain('description');
    expect(describedBy).toContain('error');
    expect(screen.getByText('Include country code.')).toBeInTheDocument();
    expect(screen.getByText('Invalid phone number format.')).toBeInTheDocument();
  });

  test('toggles password visibility with aria-label and aria-pressed', async () => {
    const user = userEvent.setup();
    render(<Input label="Password" type="password" defaultValue="secret123" />);

    // Initially type is password
    const toggleButton = screen.getByRole('button', { name: 'Show password' });
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggleButton);

    const hideButton = screen.getByRole('button', { name: 'Hide password' });
    expect(hideButton).toHaveAttribute('aria-pressed', 'true');

    const visibleInput = screen.getByRole('textbox', { name: 'Password' });
    expect(visibleInput).toHaveValue('secret123');
  });

  test('FieldGroup wraps inputs in fieldset with legend', async () => {
    const { container } = render(
      <FieldGroup legend="Date of Birth" description="Select day, month, and year">
        <Input label="Day" placeholder="DD" />
        <Input label="Month" placeholder="MM" />
        <Input label="Year" placeholder="YYYY" />
      </FieldGroup>,
    );

    expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Day' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Month' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Year' })).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  test('FileInput renders dropzone and handles file selection', async () => {
    const user = userEvent.setup();
    const onFilesSelected = vi.fn();
    const { container } = render(
      <FileInput
        label="Upload Avatar"
        description="JPEG or PNG up to 5MB"
        onFilesSelected={onFilesSelected}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();

    const file = new File(['hello'], 'avatar.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    expect(onFilesSelected).toHaveBeenCalled();
    expect(screen.getByText('avatar.png')).toBeInTheDocument();
  });
});
