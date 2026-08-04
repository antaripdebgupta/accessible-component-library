import type { Preview, Decorator } from '@storybook/react-vite';
import '../../../packages/react/src/styles.css';

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? 'light';

  if (theme === 'both') {
    return (
      <div className="flex min-h-screen flex-col gap-6 bg-slate-100 p-6 xl:flex-row dark:bg-slate-900">
        {/* Light */}
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Light Mode
            </span>
          </div>

          <div className="flex min-h-[300px] items-center justify-center bg-white p-8">
            <div className="w-full">
              <Story />
            </div>
          </div>
        </div>

        {/* Dark */}
        <div className="dark flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Dark Mode
            </span>
          </div>

          <div className="flex min-h-[300px] items-center justify-center bg-slate-950 p-8">
            <div className="w-full">
              <Story />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={isDark ? 'dark' : undefined}>
      <div
        className={`flex min-h-screen items-start justify-center p-8 transition-colors ${
          isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
        }`}
      >
        <div className="w-full max-w-4xl">
          <Story />
        </div>
      </div>
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],

  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        dynamicTitle: true,
        items: [
          {
            value: 'light',
            title: 'Light',
            icon: 'circlehollow',
          },
          {
            value: 'dark',
            title: 'Dark',
            icon: 'circle',
          },
          {
            value: 'both',
            title: 'Both',
            icon: 'sidebar',
          },
        ],
      },
    },
  },

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
