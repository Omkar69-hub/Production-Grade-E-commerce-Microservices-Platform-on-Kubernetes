import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../src/styles/theme';
import { store } from '../src/store';
import { EffectsProvider } from '../src/context/EffectsContext';
import { ComparisonProvider } from '../src/context/ComparisonContext';
import MainLayout from '../src/layouts/MainLayout';
import { HomePage } from '../src/pages/home/HomePage';

vi.mock('../src/hooks/useProducts', () => ({
  useProducts: () => ({
    data: {
      content: [
        { id: '1', name: 'Cashmere Cape', price: 150000, description: 'Luxury apparel', imageUrl: 'https://example.com/img.jpg', categoryId: 'cat-1' }
      ]
    },
    isLoading: false,
    error: null
  })
}));

describe('Stage 15C.1: Prototype-Matched Department Animations & Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.removeAttribute('data-a');
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    document.body.removeAttribute('data-a');
  });

  const renderWithProviders = (initialRoute = '/') => {
    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <EffectsProvider>
            <ComparisonProvider>
              <MemoryRouter initialEntries={[initialRoute]}>
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/brands" element={<div data-testid="brands-page">Brands Directory</div>} />
                  </Route>
                </Routes>
              </MemoryRouter>
            </ComparisonProvider>
          </EffectsProvider>
        </ThemeProvider>
      </Provider>
    );
  };

  it('1. Initial State: document.body has NO data-a attribute, preserving default homepage', () => {
    renderWithProviders('/');

    // Verify document.body has no data-a attribute before user interaction
    expect(document.body.getAttribute('data-a')).toBeNull();

    // Verify all 6 department buttons exist in the DOM with aria-selected="false"
    const deptTabs = screen.getAllByRole('tab');
    const deptNames = ['Women', 'Men', 'Kids', 'Ethnic', 'Streetwear', 'Gym'];
    deptNames.forEach(dept => {
      const button = deptTabs.find(t => t.textContent === dept);
      expect(button).toBeDefined();
      expect(button?.getAttribute('aria-selected')).toBe('false');
    });

    // Verify homepage core elements remain intact
    expect(screen.getByText(/Zero Counterfeits/i)).toBeInTheDocument();
    expect(screen.getByText(/AUTHENTICITY/i)).toBeInTheDocument();
  });

  it('2. Selecting Women sets data-a="women" and aria-selected="true" on Women tab', () => {
    renderWithProviders('/');

    const womenButton = screen.getAllByRole('tab').find(t => t.textContent === 'Women')!;
    fireEvent.click(womenButton);

    expect(document.body.getAttribute('data-a')).toBe('women');
    expect(womenButton.getAttribute('aria-selected')).toBe('true');
  });

  it('3. Repeated switching between departments updates data-a correctly without stale styles', () => {
    renderWithProviders('/');

    const getTab = (name: string) => screen.getAllByRole('tab').find(t => t.textContent === name)!;

    // Switch to Men
    fireEvent.click(getTab('Men'));
    expect(document.body.getAttribute('data-a')).toBe('men');
    expect(getTab('Men').getAttribute('aria-selected')).toBe('true');
    expect(getTab('Women').getAttribute('aria-selected')).toBe('false');

    // Switch to Kids
    fireEvent.click(getTab('Kids'));
    expect(document.body.getAttribute('data-a')).toBe('kids');
    expect(getTab('Kids').getAttribute('aria-selected')).toBe('true');
    expect(getTab('Men').getAttribute('aria-selected')).toBe('false');

    // Switch to Ethnic
    fireEvent.click(getTab('Ethnic'));
    expect(document.body.getAttribute('data-a')).toBe('ethnic');
    expect(getTab('Ethnic').getAttribute('aria-selected')).toBe('true');

    // Switch to Streetwear
    fireEvent.click(getTab('Streetwear'));
    expect(document.body.getAttribute('data-a')).toBe('streetwear');
    expect(getTab('Streetwear').getAttribute('aria-selected')).toBe('true');

    // Switch to Gym
    fireEvent.click(getTab('Gym'));
    expect(document.body.getAttribute('data-a')).toBe('gym');
    expect(getTab('Gym').getAttribute('aria-selected')).toBe('true');
  });

  it('4. Toggling the active department off returns body to default unstyled state (data-a removed)', () => {
    renderWithProviders('/');

    const womenButton = screen.getAllByRole('tab').find(t => t.textContent === 'Women')!;

    // First click: select Women
    fireEvent.click(womenButton);
    expect(document.body.getAttribute('data-a')).toBe('women');
    expect(womenButton.getAttribute('aria-selected')).toBe('true');

    // Second click: toggle off
    fireEvent.click(womenButton);
    expect(document.body.getAttribute('data-a')).toBeNull();
    expect(womenButton.getAttribute('aria-selected')).toBe('false');
  });

  it('5. Unmounting or leaving the page cleanly removes data-a from document.body', () => {
    const { unmount } = renderWithProviders('/');

    const menButton = screen.getAllByRole('tab').find(t => t.textContent === 'Men')!;
    fireEvent.click(menButton);
    expect(document.body.getAttribute('data-a')).toBe('men');

    // Unmount
    unmount();
    expect(document.body.getAttribute('data-a')).toBeNull();
  });
});
