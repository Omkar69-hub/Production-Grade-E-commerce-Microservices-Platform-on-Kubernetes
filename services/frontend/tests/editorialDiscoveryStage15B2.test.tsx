import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EditorialRunwayTrack } from '../src/components/editorial/EditorialRunwayTrack';
import { GarmentColorwaySwatches, type ColorwayItem } from '../src/components/editorial/GarmentColorwaySwatches';
import { CuratedOccasionPanels, OCCASIONS_DATA } from '../src/components/editorial/CuratedOccasionPanels';
import { CLOTHING_CATALOG } from '../src/data/clothingCatalogData';

describe('LUMIÈRE Stage 15B-2: Interactive Editorial Discovery Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================================================================
     1. HORIZONTAL EDITORIAL RUNWAY TESTS
  ========================================================================= */
  describe('1. Horizontal Editorial Runway (EditorialRunwayTrack)', () => {
    const mockScrollBy = vi.fn();

    beforeEach(() => {
      mockScrollBy.mockClear();
      Element.prototype.scrollBy = mockScrollBy;
    });

    it('renders runway track with accessible labels, titles, and children', () => {
      render(
        <EditorialRunwayTrack
          eyebrow="ATELIER SHOWCASE"
          title="Autumn Runway"
          subtitle="Selected haute silhouttes"
          ariaLabel="Autumn Runway Track"
        >
          <div data-testid="runway-card-1">Card 1</div>
          <div data-testid="runway-card-2">Card 2</div>
        </EditorialRunwayTrack>
      );

      expect(screen.getByText('ATELIER SHOWCASE')).toBeInTheDocument();
      expect(screen.getByText('Autumn Runway')).toBeInTheDocument();
      expect(screen.getByText('Selected haute silhouttes')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Autumn Runway Track' })).toBeInTheDocument();
      expect(screen.getByTestId('runway-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('runway-card-2')).toBeInTheDocument();
    });

    it('renders accessible Prev and Next navigation buttons with proper aria-labels', () => {
      render(
        <EditorialRunwayTrack title="Runway Test">
          <div>Item 1</div>
        </EditorialRunwayTrack>
      );

      const prevBtn = screen.getByRole('button', { name: /previous runway looks/i });
      const nextBtn = screen.getByRole('button', { name: /next runway looks/i });

      expect(prevBtn).toBeInTheDocument();
      expect(nextBtn).toBeInTheDocument();
      expect(prevBtn).toBeDisabled(); // Initially disabled at scrollLeft = 0
    });

    it('clicking Next button triggers scrollBy on the track', () => {
      render(
        <EditorialRunwayTrack title="Runway Test">
          <div>Item 1</div>
          <div>Item 2</div>
        </EditorialRunwayTrack>
      );

      const nextBtn = screen.getByRole('button', { name: /next runway looks/i });
      fireEvent.click(nextBtn);

      expect(mockScrollBy).toHaveBeenCalledTimes(1);
      const callArg = mockScrollBy.mock.calls[0][0];
      expect(callArg.left).toBeGreaterThan(0);
      expect(callArg.behavior).toBe('smooth');
    });

    it('respects prefers-reduced-motion by using behavior: auto for scrollBy', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <EditorialRunwayTrack title="Reduced Motion Runway">
          <div>Item 1</div>
        </EditorialRunwayTrack>
      );

      const nextBtn = screen.getByRole('button', { name: /next runway looks/i });
      fireEvent.click(nextBtn);

      expect(mockScrollBy).toHaveBeenCalledTimes(1);
      const callArg = mockScrollBy.mock.calls[0][0];
      expect(callArg.behavior).toBe('auto');
    });

    it('prevents drag gestures from triggering accidental child clicks', () => {
      const handleChildClick = vi.fn();

      render(
        <EditorialRunwayTrack title="Drag Test">
          <button data-testid="child-btn" onClick={handleChildClick}>
            Clickable Look
          </button>
        </EditorialRunwayTrack>
      );

      const track = screen.getByRole('region', { name: /curated editorial fashion runway/i });
      const childBtn = screen.getByTestId('child-btn');

      // 1. Simulate mouse drag: pointerDown at x=100, move to x=50 (delta 50px > 6px threshold), pointerUp
      fireEvent.pointerDown(track, { pointerType: 'mouse', button: 0, clientX: 100 });
      window.dispatchEvent(new MouseEvent('pointermove', { clientX: 50 }));
      window.dispatchEvent(new MouseEvent('pointerup'));

      // 2. Browser fires click on child element right after mouse drag
      fireEvent.click(childBtn);

      // The click must have been intercepted and suppressed
      expect(handleChildClick).not.toHaveBeenCalled();

      // 3. Clean click without drag succeeds
      fireEvent.click(childBtn);
      expect(handleChildClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation via ArrowLeft and ArrowRight on track', () => {
      render(
        <EditorialRunwayTrack title="Keyboard Runway">
          <div>Card</div>
        </EditorialRunwayTrack>
      );

      const track = screen.getByRole('region', { name: /curated editorial fashion runway/i });
      track.focus();

      fireEvent.keyDown(track, { key: 'ArrowRight' });
      expect(mockScrollBy).toHaveBeenCalledWith(expect.objectContaining({ left: expect.any(Number) }));

      fireEvent.keyDown(track, { key: 'ArrowLeft' });
      expect(mockScrollBy).toHaveBeenCalledTimes(2);
    });
  });

  /* =========================================================================
     2. GARMENT COLORWAY SWATCHES TESTS
  ========================================================================= */
  describe('2. Garment Colorway Swatches (GarmentColorwaySwatches)', () => {
    const mockVerifiedColorways: ColorwayItem[] = [
      {
        name: 'Crimson Red',
        hex: '#8B1424',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Antique Gold',
        hex: '#C5A059',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Deep Emerald',
        hex: '#0F4734',
        imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=900',
      },
    ];

    it('renders accessible radio group when verified multi-image colorway data exists', () => {
      const handleSelect = vi.fn();

      render(
        <GarmentColorwaySwatches
          colorways={mockVerifiedColorways}
          selectedColor="Crimson Red"
          onSelectColorway={handleSelect}
          productName="Royal Heritage Lehenga"
        />
      );

      // Verify radiogroup container
      const radioGroup = screen.getByRole('radiogroup', { name: /colorways for royal heritage lehenga/i });
      expect(radioGroup).toBeInTheDocument();

      // Verify all 3 swatches have role="radio" and correct aria-checked
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);
      expect(radios[0]).toHaveAttribute('aria-checked', 'true');
      expect(radios[0]).toHaveAttribute('aria-label', 'Crimson Red colorway');
      expect(radios[1]).toHaveAttribute('aria-checked', 'false');
      expect(radios[2]).toHaveAttribute('aria-checked', 'false');

      // Verify live selected color label
      expect(screen.getByText(/Crimson Red/i)).toBeInTheDocument();
    });

    it('clicking a swatch triggers onSelectColorway without page reload', () => {
      const handleSelect = vi.fn();

      render(
        <GarmentColorwaySwatches
          colorways={mockVerifiedColorways}
          selectedColor="Crimson Red"
          onSelectColorway={handleSelect}
          productName="Royal Heritage Lehenga"
        />
      );

      const goldSwatch = screen.getByRole('radio', { name: /antique gold colorway/i });
      fireEvent.click(goldSwatch);

      expect(handleSelect).toHaveBeenCalledTimes(1);
      expect(handleSelect).toHaveBeenCalledWith(mockVerifiedColorways[1]);
    });

    it('supports keyboard navigation (ArrowRight / ArrowLeft / Enter) across swatches', () => {
      const handleSelect = vi.fn();

      render(
        <GarmentColorwaySwatches
          colorways={mockVerifiedColorways}
          selectedColor="Crimson Red"
          onSelectColorway={handleSelect}
          productName="Royal Heritage Lehenga"
        />
      );

      const crimsonSwatch = screen.getByRole('radio', { name: /crimson red colorway/i });
      crimsonSwatch.focus();

      // ArrowRight selects next (Antique Gold)
      fireEvent.keyDown(crimsonSwatch, { key: 'ArrowRight' });
      expect(handleSelect).toHaveBeenCalledWith(mockVerifiedColorways[1]);

      // ArrowLeft from first item wraps to last (Deep Emerald)
      fireEvent.keyDown(crimsonSwatch, { key: 'ArrowLeft' });
      expect(handleSelect).toHaveBeenCalledWith(mockVerifiedColorways[2]);
    });

    it('fails closed when NO verified imagery exists: renders NO misleading interactive swatches', () => {
      // Products with only text colors and NO preview image mappings
      const textOnlyColors = ['Crimson Red', 'Antique Gold', 'Deep Emerald'];

      render(
        <GarmentColorwaySwatches
          colorways={[]}
          colorNames={textOnlyColors}
          productName="Unverified Silhouette"
        />
      );

      // Must NOT render any interactive radio buttons
      expect(screen.queryByRole('radiogroup')).toBeNull();
      expect(screen.queryAllByRole('radio')).toHaveLength(0);

      // Must render honest static reference chips
      expect(screen.getByText(/Atelier Palette Reference/i)).toBeInTheDocument();
      expect(screen.getByText('Crimson Red')).toBeInTheDocument();
      expect(screen.getByText('Antique Gold')).toBeInTheDocument();
      expect(screen.getByText('Deep Emerald')).toBeInTheDocument();

      // Informs the customer about salon consultations instead of fake swatches
      expect(screen.getByText(/Single verified silhouette preview shown/i)).toBeInTheDocument();
    });

    it('interactive swatch selection dynamically updates displayed color in stateful parent', () => {
      const StatefulHost: React.FC = () => {
        const [activeColor, setActiveColor] = useState<ColorwayItem>(mockVerifiedColorways[0]);
        return (
          <div>
            <img src={activeColor.imageUrl} alt={`Preview in ${activeColor.name}`} data-testid="preview-img" />
            <GarmentColorwaySwatches
              colorways={mockVerifiedColorways}
              selectedColor={activeColor.name}
              onSelectColorway={(c) => setActiveColor(c)}
              productName="Test Garment"
            />
          </div>
        );
      };

      render(<StatefulHost />);

      const img = screen.getByTestId('preview-img');
      expect(img).toHaveAttribute('src', mockVerifiedColorways[0].imageUrl);
      expect(img).toHaveAttribute('alt', 'Preview in Crimson Red');

      // Click Deep Emerald swatch
      const emeraldSwatch = screen.getByRole('radio', { name: /deep emerald colorway/i });
      fireEvent.click(emeraldSwatch);

      // Image src updates immediately without page reload
      expect(img).toHaveAttribute('src', mockVerifiedColorways[2].imageUrl);
      expect(img).toHaveAttribute('alt', 'Preview in Deep Emerald');
      expect(emeraldSwatch).toHaveAttribute('aria-checked', 'true');
    });
  });

  /* =========================================================================
     3. CURATED OCCASION PANELS TESTS
  ========================================================================= */
  describe('3. Curated Occasion Panels (CuratedOccasionPanels)', () => {
    it('renders all 3 authentic occasion categories from verified data', () => {
      render(
        <MemoryRouter>
          <CuratedOccasionPanels />
        </MemoryRouter>
      );

      expect(screen.getByText('CURATED OCCASION EDITORIALS')).toBeInTheDocument();
      expect(screen.getByText('Edits for Every Grand Occasion')).toBeInTheDocument();

      // Check the 3 occasion titles
      expect(screen.getByText('Grand Sangeet & Celebrations')).toBeInTheDocument();
      expect(screen.getByText('Royal Heritage & Ceremonials')).toBeInTheDocument();
      expect(screen.getByText('Sartorial Soirée & Red Carpet')).toBeInTheDocument();
    });

    it('implements correct accessible accordion semantics (aria-expanded, aria-controls, role=region)', () => {
      render(
        <MemoryRouter>
          <CuratedOccasionPanels initialExpandedId="grand-sangeet" />
        </MemoryRouter>
      );

      const sangeetTab = screen.getByRole('button', { name: /grand sangeet & celebrations/i });
      const royalTab = screen.getByRole('button', { name: /royal heritage & ceremonials/i });

      expect(sangeetTab).toHaveAttribute('aria-expanded', 'true');
      expect(sangeetTab).toHaveAttribute('aria-controls', 'occasion-panel-grand-sangeet');

      expect(royalTab).toHaveAttribute('aria-expanded', 'false');
      expect(royalTab).toHaveAttribute('aria-controls', 'occasion-panel-royal-heritage');

      const sangeetPanel = document.getElementById('occasion-panel-grand-sangeet');
      expect(sangeetPanel).toBeInTheDocument();
      expect(sangeetPanel).toHaveAttribute('role', 'region');
      expect(sangeetPanel).not.toHaveAttribute('hidden');

      const royalPanel = document.getElementById('occasion-panel-royal-heritage');
      expect(royalPanel).toHaveAttribute('hidden');
    });

    it('toggles expansion state when an occasion header is clicked', () => {
      render(
        <MemoryRouter>
          <CuratedOccasionPanels initialExpandedId="grand-sangeet" />
        </MemoryRouter>
      );

      const royalTab = screen.getByRole('button', { name: /royal heritage & ceremonials/i });
      fireEvent.click(royalTab);

      // Royal Heritage becomes expanded
      expect(royalTab).toHaveAttribute('aria-expanded', 'true');
      const sangeetTab = screen.getByRole('button', { name: /grand sangeet & celebrations/i });
      expect(sangeetTab).toHaveAttribute('aria-expanded', 'false');
    });

    it('groups verified catalog items strictly by authentic subcategories without hallucinated inventory', () => {
      render(
        <MemoryRouter>
          <CuratedOccasionPanels initialExpandedId="royal-heritage" />
        </MemoryRouter>
      );

      // Royal Heritage includes Bridal Lehengas & Sherwanis/Bandhgalas
      // E.g. Sabyasachi Royal Heritage Zardozi Velvet Lehenga
      expect(screen.getByText('Royal Heritage Zardozi Velvet Lehenga')).toBeInTheDocument();
      expect(screen.getByText('Royal Jacquard Sherwani with Zari Detailing')).toBeInTheDocument();
      expect(screen.getByText('Regalia Asymmetrical Draped Bandhgala')).toBeInTheDocument();
    });

    it('supports keyboard navigation (ArrowDown / ArrowUp) across occasion tabs', () => {
      render(
        <MemoryRouter>
          <CuratedOccasionPanels />
        </MemoryRouter>
      );

      const sangeetTab = screen.getByRole('button', { name: /grand sangeet & celebrations/i });
      sangeetTab.focus();

      fireEvent.keyDown(sangeetTab, { key: 'ArrowDown' });
      const royalTab = screen.getByRole('button', { name: /royal heritage & ceremonials/i });
      expect(document.activeElement).toBe(royalTab);
    });
  });

  /* =========================================================================
     4. REFERRAL SAFETY REGRESSION ASSERTIONS
  ========================================================================= */
  describe('4. Referral Safety in Discovery Components', () => {
    it('never renders Add to Cart, quantity selectors, or purchase controls in occasion panels', () => {
      render(
        <MemoryRouter>
          <CuratedOccasionPanels initialExpandedId="grand-sangeet" />
        </MemoryRouter>
      );

      // Verify absence of any shopping bag or purchase controls
      expect(screen.queryByText(/add to cart/i)).toBeNull();
      expect(screen.queryByText(/add to bag/i)).toBeNull();
      expect(screen.queryByText(/acquire piece/i)).toBeNull();
      expect(screen.queryByText(/allocation exhausted/i)).toBeNull();
      expect(screen.queryByRole('button', { name: '+' })).toBeNull();
      expect(screen.queryByRole('button', { name: '-' })).toBeNull();

      // Action buttons must fail closed to safe dossier discovery
      const dossierButtons = screen.getAllByRole('link', { name: /dossier/i });
      expect(dossierButtons.length).toBeGreaterThan(0);
      for (const btn of dossierButtons) {
        expect(btn).toHaveAttribute('href', expect.stringMatching(/^\/products\/prod-/));
      }
    });

    it('ensures all occasion pieces maintain valid INR prices or Price upon atelier inquiry', () => {
      render(
        <MemoryRouter>
          <CuratedOccasionPanels initialExpandedId="sartorial-soiree" />
        </MemoryRouter>
      );

      // Inquire about atelier statuses
      const statusLabels = screen.getAllByText(/Price upon atelier inquiry/i);
      expect(statusLabels.length).toBeGreaterThan(0);

      // No arbitrary foreign currencies
      expect(screen.queryByText(/\$/)).toBeNull();
      expect(screen.queryByText(/€/)).toBeNull();
      expect(screen.queryByText(/£/)).toBeNull();
    });
  });
});
