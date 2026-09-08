import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import jestAxe from 'jest-axe';
import { describe, expect, test, vi } from 'vitest';
import { Textarea } from './Textarea';

const { axe, toHaveNoViolations } = jestAxe;
expect.extend(toHaveNoViolations);

describe('Textarea component', () => {
  test('renders native textarea with label association', () => {
    render(<Textarea label="Feedback" placeholder="Enter feedback..." />);
    const textarea = screen.getByRole('textbox', { name: 'Feedback' });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Enter feedback...');
  });

  test('has no axe violations for all primary variants', async () => {
    const { container: defaultView } = render(
      <Textarea label="Default Textarea" description="Enter details" />,
    );
    expect(await axe(defaultView)).toHaveNoViolations();

    const { container: invalidView } = render(
      <Textarea label="Invalid Textarea" error="This field is required" />,
    );
    expect(await axe(invalidView)).toHaveNoViolations();

    const { container: disabledView } = render(
      <Textarea label="Disabled Textarea" disabled value="Fixed content" />,
    );
    expect(await axe(disabledView)).toHaveNoViolations();

    const { container: buttonView } = render(
      <Textarea label="Chat Message" actionButton={<button type="button">Send</button>} />,
    );
    expect(await axe(buttonView)).toHaveNoViolations();
  });

  test('combines helper description and error in aria-describedby without overwriting', () => {
    render(
      <Textarea
        label="Comment"
        description="Must be respectful."
        error="Comment contains invalid characters."
        maxCount={100}
      />,
    );

    const textarea = screen.getByRole('textbox', { name: 'Comment' });
    const describedBy = textarea.getAttribute('aria-describedby') || '';

    expect(describedBy).toContain('description');
    expect(describedBy).toContain('error');
    expect(describedBy).toContain('counter');

    expect(screen.getByText('Must be respectful.')).toBeInTheDocument();
    expect(screen.getByText('Comment contains invalid characters.')).toBeInTheDocument();
    expect(screen.getByText('0/100')).toBeInTheDocument();
  });

  test('sets aria-invalid="true" when error is provided', () => {
    render(<Textarea label="Bio" error="Bio is too short" />);
    const textarea = screen.getByRole('textbox', { name: 'Bio' });
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  test('handles submitOnEnter keyboard interaction', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <Textarea label="Message" submitOnEnter onSubmit={onSubmit} defaultValue="Hello world" />,
    );

    const textarea = screen.getByRole('textbox', { name: 'Message' });
    await user.type(textarea, '{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('Hello world', expect.anything());
  });

  test('does NOT submit on Shift+Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Textarea label="Message" submitOnEnter onSubmit={onSubmit} defaultValue="Line 1" />);

    const textarea = screen.getByRole('textbox', { name: 'Message' });
    await user.type(textarea, '{Shift>}{Enter}{/Shift}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('supports integrated action button without disrupting textarea focus', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(
      <Textarea
        label="Chat Input"
        actionButton={
          <button type="button" onClick={onSend}>
            Send Message
          </button>
        }
      />,
    );

    const textarea = screen.getByRole('textbox', { name: 'Chat Input' });
    const sendButton = screen.getByRole('button', { name: 'Send Message' });

    await user.type(textarea, 'Hi there');
    expect(textarea).toHaveValue('Hi there');

    await user.click(sendButton);
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  test('character count updates and triggers over limit visual styling', async () => {
    const user = userEvent.setup();
    render(<Textarea label="Bio" maxCount={5} defaultValue="Hello" />);

    expect(screen.getByText('5/5')).toBeInTheDocument();

    const textarea = screen.getByRole('textbox', { name: 'Bio' });
    await user.type(textarea, '!');

    expect(screen.getByText('6/5')).toBeInTheDocument();
    const counter = screen.getByText('6/5');
    expect(counter).toHaveClass('text-danger-default');
  });

  test('RTL direction applies dir attribute and alignment styles', () => {
    render(<Textarea label="Arabic Text" dir="rtl" />);
    const textarea = screen.getByRole('textbox', { name: 'Arabic Text' });
    expect(textarea).toHaveClass('text-right');
  });

  test('autoResize adjusts height dynamically and respects maxRows', async () => {
    const user = userEvent.setup();
    render(<Textarea label="Auto Resizing" autoResize maxRows={5} defaultValue="Line 1" />);

    const textarea = screen.getByRole('textbox', { name: 'Auto Resizing' });
    expect(textarea).toBeInTheDocument();

    await user.type(textarea, '\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6');
    expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6');
  });

  test('updates value in controlled mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea label="Controlled" value="Initial text" onChange={onChange} />);

    const textarea = screen.getByRole('textbox', { name: 'Controlled' });
    expect(textarea).toHaveValue('Initial text');

    await user.type(textarea, ' additional');
    expect(onChange).toHaveBeenCalled();
  });
});
