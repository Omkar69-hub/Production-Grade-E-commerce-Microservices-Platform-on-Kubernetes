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
import BrandDirectoryPage from '../src/pages/brands/BrandDirectoryPage';
import { ALL_VERIFIED_BRANDS, BRANDS_DATA } from '../src/data/brandsData';

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

describe('Stage 15C.2: Integrated Navigation & Official Brand Logo Directory', () => {
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

  const renderApp = (initialRoute = '/') => {
    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <EffectsProvider>
            <ComparisonProvider>
              <MemoryRouter initialEntries={[initialRoute]}>
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/brands" element={<BrandDirectoryPage />} />
                    <Route path="/products" element={<div data-testid="products-page">Collections</div>} />
                  </Route>
                </Routes>
              </MemoryRouter>
            </ComparisonProvider>
          </EffectsProvider>
        </ThemeProvider>
      </Provider>
    );
  };

  describe('1. Single Integrated Desktop Navigation Row', () => {
    it('renders exactly one single navigation bar containing all 9 required items in order', () => {
      renderApp('/');

      // Verify the separate .dept row does NOT exist in the DOM
      expect(document.querySelector('.dept')).toBeNull();
      expect(document.getElementById('dept')).toBeNull();

      // Find the primary navigation bar
      const nav = screen.getByRole('navigation', { name: /Primary Navigation/i });
      expect(nav).toBeInTheDocument();

      // Verify all 9 primary navigation labels are present inside the primary nav
      const expectedItems = [
        'Home',
        'Women',
        'Men',
        'Kids',
        'Ethnic',
        'Streetwear',
        'Gym',
        'Brands Directory',
        'Collections'
      ];

      expectedItems.forEach((label) => {
        const item = screen.getAllByText(label).find((el) => nav.contains(el));
        expect(item, `Expected "${label}" to be inside primary navigation`).toBeDefined();
      });
    });

    it('has LUMIÈRE branding on left, and Search, Saved/Wishlist, and Sign In on right', () => {
      renderApp('/');

      // Left branding
      expect(screen.getAllByText('LUMIÈRE').length).toBeGreaterThan(0);
      expect(screen.getByText(/HAUTE COUTURE & MAISON ATELIER/i)).toBeInTheDocument();

      // Right actions
      expect(screen.getByPlaceholderText(/Search collections/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Curated Wishlist/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
    });
  });

  describe('2. Preserved Department Animations in Integrated Navigation', () => {
    it('clicking Women activates data-a="women" on document.body and marks Women as selected', () => {
      renderApp('/');

      const nav = screen.getByRole('navigation', { name: /Primary Navigation/i });
      const womenTab = screen.getAllByRole('tab').find((t) => t.textContent === 'Women' && nav.contains(t))!;
      expect(womenTab).toBeDefined();
      expect(womenTab.getAttribute('aria-selected')).toBe('false');

      fireEvent.click(womenTab);
      expect(document.body.getAttribute('data-a')).toBe('women');
      expect(womenTab.getAttribute('aria-selected')).toBe('true');

      // Clicking Women again toggles it off
      fireEvent.click(womenTab);
      expect(document.body.getAttribute('data-a')).toBeNull();
      expect(womenTab.getAttribute('aria-selected')).toBe('false');
    });

    it('switching between Ethnic, Streetwear, and Gym applies correct animation tags', () => {
      renderApp('/');

      const nav = screen.getByRole('navigation', { name: /Primary Navigation/i });
      const getTab = (name: string) => screen.getAllByRole('tab').find((t) => t.textContent === name && nav.contains(t))!;

      // Click Ethnic
      fireEvent.click(getTab('Ethnic'));
      expect(document.body.getAttribute('data-a')).toBe('ethnic');

      // Click Streetwear
      fireEvent.click(getTab('Streetwear'));
      expect(document.body.getAttribute('data-a')).toBe('streetwear');

      // Click Gym
      fireEvent.click(getTab('Gym'));
      expect(document.body.getAttribute('data-a')).toBe('gym');
    });

    it('clicking Home resets active department animations back to default', () => {
      renderApp('/');

      const nav = screen.getByRole('navigation', { name: /Primary Navigation/i });
      const gymTab = screen.getAllByRole('tab').find((t) => t.textContent === 'Gym' && nav.contains(t))!;
      fireEvent.click(gymTab);
      expect(document.body.getAttribute('data-a')).toBe('gym');

      // Click Home button in primary nav
      const homeBtn = screen.getAllByText('Home').find((el) => nav.contains(el))!;
      fireEvent.click(homeBtn);
      expect(document.body.getAttribute('data-a')).toBeNull();
    });
  });

  describe('3. Brands Directory & Official Referral Routing', () => {
    it('renders all verified brands from registry with official website links and security attributes', () => {
      renderApp('/brands');

      const brandList = ALL_VERIFIED_BRANDS || BRANDS_DATA;
      expect(screen.getByText(new RegExp(`Displaying ${brandList.length} verified official brands`, 'i'))).toBeInTheDocument();

      // Check Nike card
      const nikeTitle = screen.getByRole('link', { name: /^Nike$/i });
      expect(nikeTitle).toBeInTheDocument();
      expect(nikeTitle.getAttribute('href')).toContain('nike.com');
      expect(nikeTitle.getAttribute('target')).toBe('_blank');
      expect(nikeTitle.getAttribute('rel')).toBe('noopener noreferrer');

      // Check Adidas card
      const adidasTitle = screen.getByRole('link', { name: /^Adidas$/i });
      expect(adidasTitle).toBeInTheDocument();
      expect(adidasTitle.getAttribute('href')).toContain('adidas.co.in');
      expect(adidasTitle.getAttribute('target')).toBe('_blank');

      // Check Sabyasachi card
      const sabyasachiTitle = screen.getByRole('link', { name: /^Sabyasachi$/i });
      expect(sabyasachiTitle).toBeInTheDocument();
      expect(sabyasachiTitle.getAttribute('href')).toBe('https://www.sabyasachi.com');
      expect(sabyasachiTitle.getAttribute('target')).toBe('_blank');
    }, 30000);

    it('filters brands correctly in real time when searching by name', () => {
      renderApp('/brands');

      const searchInput = screen.getByPlaceholderText(/Search brand, atelier city, or style/i);
      fireEvent.change(searchInput, { target: { value: 'Puma' } });

      expect(screen.getByRole('link', { name: /^Puma$/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /^Sabyasachi$/i })).toBeNull();
      expect(screen.getByText(/Displaying 1 verified official brands/i)).toBeInTheDocument();
    }, 20000);

    it('filters by origin correctly (Indian Ateliers vs Global Luxury)', () => {
      renderApp('/brands');

      const indianTab = screen.getByRole('button', { name: /Indian Ateliers/i });
      fireEvent.click(indianTab);

      // Sabyasachi (Indian) should be visible, Nike (Global) should not
      expect(screen.getByRole('link', { name: /^Sabyasachi$/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /^Nike$/i })).toBeNull();
    }, 20000);
  });
});
