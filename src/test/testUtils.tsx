import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { GenerationProvider } from '../contexts/GenerationContext';
import { ThemeProvider } from '../contexts/ThemeContext';

/**
 * Custom render function that wraps components with all necessary providers
 */
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <ThemeProvider>
      <GenerationProvider>{children}</GenerationProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
