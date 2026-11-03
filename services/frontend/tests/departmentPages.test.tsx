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
import {
  WomenPage,
  MenPage,
  KidsPage,
  StreetwearPage,
  EthnicPage,
  GymPage,
} from '../src/pages/departments';

vi.mock('../src/hooks/useProducts', () => ({
  useProducts: () => ({
    data: {
      content: []
    },
    isLoading: false,
    error: null
  })
}));

describe('Independent Department Pages & Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.removeAttribute('data-a');
    window.scrollTo = vi.fn();
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

  const renderApp = (initialRoute: string) => {
    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <EffectsProvider>
            <ComparisonProvider>
              <MemoryRouter initialEntries={[initialRoute]}>
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/women" element={<WomenPage />} />
                    <Route path="/men" element={<MenPage />} />
                    <Route path="/kids" element={<KidsPage />} />
                    <Route path="/streetwear" element={<StreetwearPage />} />
                    <Route path="/ethnic" element={<EthnicPage />} />
                    <Route path="/gym" element={<GymPage />} />
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

  it('1. Renders WomenPage at /women with dedicated hero, metadata, and women catalog products', () => {
    renderApp('/women');

    expect(document.title).toContain('Women');
    expect(document.body.getAttribute('data-a')).toBe('women');

    // Hero title and subtitle
    expect(screen.getByRole('heading', { level: 1, name: /Wear the day/i })).toBeInTheDocument();
    expect(screen.getByText(/Dresses, tailoring and everyday basics/i)).toBeInTheDocument();

    // Breadcrumbs
    const breadcrumb = screen.getByLabelText('breadcrumb');
    expect(breadcrumb).toHaveTextContent('DEPARTMENTS');
    expect(breadcrumb).toHaveTextContent('Women');

    // Verify products rendered from catalog (e.g. Sabyasachi, Anita Dongre)
    expect(screen.getByText(/Royal Heritage Zardozi Velvet Lehenga/i)).toBeInTheDocument();
    expect(screen.getByText(/Pichhwai Hand-Painted Silk Saree/i)).toBeInTheDocument();

    // Verify featured maison badges
    expect(screen.getByRole('link', { name: 'Reformation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'COS' })).toBeInTheDocument();
  }, 30000);

  it('2. Renders MenPage at /men with dedicated hero, metadata, and men catalog products', () => {
    renderApp('/men');

    expect(document.title).toContain('Men');
    expect(document.body.getAttribute('data-a')).toBe('men');

    expect(screen.getByRole('heading', { level: 1, name: /Sharp every day/i })).toBeInTheDocument();
    expect(screen.getByText(/Shirts, denim and tailoring/i)).toBeInTheDocument();

    // Verify Men items
    expect(screen.getByText(/Royal Jacquard Sherwani with Zari Detailing/i)).toBeInTheDocument();
    expect(screen.getByText(/Bespoke Super 250s Fine Merino Wool Tuxedo/i)).toBeInTheDocument();
  });

  it('3. Renders KidsPage at /kids with dedicated hero, metadata, and kids catalog products', () => {
    renderApp('/kids');

    expect(document.title).toContain('Kids');
    expect(document.body.getAttribute('data-a')).toBe('kids');

    expect(screen.getByRole('heading', { level: 1, name: /Play in colour/i })).toBeInTheDocument();

    // Verify Kids items
    expect(screen.getByText(/Boys’ Classic Tailored Waistcoat, Shirt & Trouser Set/i)).toBeInTheDocument();
    expect(screen.getByText(/Pure Organic Cotton Breathable Baby Romper 3-Pack/i)).toBeInTheDocument();
    expect(screen.getByText(/Pure Combed Cotton 3-Piece Bodysuit & Pant Playwear Set/i)).toBeInTheDocument();
  });

  it('4. Renders StreetwearPage at /streetwear with dedicated hero and streetwear pieces', () => {
    renderApp('/streetwear');

    expect(document.title).toContain('Streetwear');
    expect(document.body.getAttribute('data-a')).toBe('streetwear');

    expect(screen.getByRole('heading', { level: 1, name: /Loud fits/i })).toBeInTheDocument();

    // Verify Streetwear items
    expect(screen.getByText(/Heavyweight Pop-Culture Oversized Graphic T-Shirt/i)).toBeInTheDocument();
    expect(screen.getByText(/Heavy Gauge Boxy Fit Typography Fleece Hoodie/i)).toBeInTheDocument();
    expect(screen.getByText(/Textured Cuban Collar Relaxed Bowling Shirt & Cargos/i)).toBeInTheDocument();
  });

  it('5. Renders EthnicPage at /ethnic with heritage categories and ethnic pieces', () => {
    renderApp('/ethnic');

    expect(document.title).toContain('Ethnic');
    expect(document.body.getAttribute('data-a')).toBe('ethnic');

    expect(screen.getByRole('heading', { level: 1, name: /Rooted in craft/i })).toBeInTheDocument();

    // Verify Ethnic items on first page
    expect(screen.getByText(/Royal Heritage Zardozi Velvet Lehenga/i)).toBeInTheDocument();
    expect(screen.getByText(/Pichhwai Hand-Painted Silk Saree/i)).toBeInTheDocument();
    expect(screen.getByText(/Handloom Chanderi Brocade Kurta & Dupatta/i)).toBeInTheDocument();
  });

  it('6. Renders GymPage at /gym with activewear pieces and performance badges', () => {
    renderApp('/gym');

    expect(document.title).toContain('Gym');
    expect(document.body.getAttribute('data-a')).toBe('gym');

    expect(screen.getByRole('heading', { level: 1, name: /Move in colour/i })).toBeInTheDocument();

    // Verify Gym & Activewear items
    expect(screen.getByText(/Dri-FIT ADV Aeroloft Engineered Training Top/i)).toBeInTheDocument();
    expect(screen.getByText(/Primeknit Aeroready High-Performance Track Jacket/i)).toBeInTheDocument();
    expect(screen.getByText(/dryCELL Seamless Performance Workout Tights/i)).toBeInTheDocument();
  });

  it('7. DepartmentProductGrid search filtering filters products dynamically', () => {
    renderApp('/women');

    const searchInput = screen.getByPlaceholderText(/Search Women pieces/i);
    fireEvent.change(searchInput, { target: { value: 'Sabyasachi' } });

    expect(screen.getByText(/Royal Heritage Zardozi Velvet Lehenga/i)).toBeInTheDocument();
    expect(screen.queryByText(/Pichhwai Hand-Painted Silk Saree/i)).not.toBeInTheDocument();
  });

  it('8. DepartmentProductGrid shows polite empty state when filter matches 0 products', () => {
    renderApp('/women');

    const searchInput = screen.getByPlaceholderText(/Search Women pieces/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentProductXYZ123' } });

    expect(screen.getByText(/No Silhouettes Found in this Selection/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Filters & View All/i })).toBeInTheDocument();
  });

  it('9. Desktop navigation clicks route directly to department pages without changing homepage code', async () => {
    renderApp('/');

    // Baseline homepage
    expect(screen.getByText(/Zero Counterfeits/i)).toBeInTheDocument();
    expect(document.body.getAttribute('data-a')).toBeNull();

    // Click Women in navigation
    const nav = screen.getByRole('navigation', { name: /Primary Navigation/i });
    const womenTab = screen.getAllByRole('tab').find(t => t.textContent === 'Women' && nav.contains(t))!;
    fireEvent.click(womenTab);

    // After clicking Women, the WomenPage renders
    expect(await screen.findByRole('heading', { level: 1, name: /Wear the day/i })).toBeInTheDocument();
    expect(document.body.getAttribute('data-a')).toBe('women');
  }, 30000);
});
