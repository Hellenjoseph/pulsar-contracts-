import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import CheckoutWidget from './CheckoutWidget';

expect.extend(toHaveNoViolations);

// Mock the contract call hook so the widget renders without side effects.
jest.mock('../hooks/useContractCall', () => ({
  __esModule: true,
  useContractCall: jest.fn(() => ({
    data: null,
    loading: false,
    error: null,
    call: jest.fn(),
  })),
  default: jest.fn(() => ({
    data: null,
    loading: false,
    error: null,
    call: jest.fn(),
  })),
}));

describe('CheckoutWidget accessibility', () => {
  beforeEach(() => {
    // Provide a minimal Freighter mock so the component does not throw.
    (window as unknown as { freighter?: unknown }).freighter = {
      isConnected: jest.fn().mockResolvedValue({ isConnected: false }),
      getPublicKey: jest.fn().mockResolvedValue({ publicKey: null }),
      signTransaction: jest.fn().mockResolvedValue({ signedTxXdr: '' }),
    };
  });

  afterEach(() => {
    delete (window as unknown as { freighter?: unknown }).freighter;
    jest.clearAllMocks();
  });

  it('associates an accessible label with the amount value', () => {
    render(<CheckoutWidget amount={1000} />);

    // The amount value should be reachable via its accessible name "Amount: 1000".
    const amountElement = screen.getByLabelText(/Amount:\s*1000/);
    expect(amountElement).toBeInTheDocument();
    expect(amountElement).toHaveTextContent(/1000/);
  });

  it('has no axe-core accessibility violations', async () => {
    const { container } = render(<CheckoutWidget amount={1000} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});