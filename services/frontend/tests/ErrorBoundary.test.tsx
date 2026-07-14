import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from '../src/components/layout/ErrorBoundary';

const Bomb = () => {
  throw new Error('Kaboom');
};

describe('ErrorBoundary', () => {
  it('should catch errors and display fallback UI', () => {
    // Suppress console.error for this expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Oops, something went wrong.')).toBeInTheDocument();
    
    spy.mockRestore();
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>All is well</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('All is well')).toBeInTheDocument();
  });
});
