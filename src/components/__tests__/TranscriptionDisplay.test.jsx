import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TranscriptionDisplay from '../TranscriptionDisplay';

const defineClipboard = (value) => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    writable: true,
    value,
  });
};

describe('TranscriptionDisplay', () => {
  let clipboardDescriptor;

  beforeEach(() => {
    clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    defineClipboard({
      writeText: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    if (clipboardDescriptor) {
      Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
    } else {
      delete navigator.clipboard;
    }
    vi.restoreAllMocks();
  });

  it('renders nothing when text is empty', () => {
    const { container } = render(<TranscriptionDisplay text="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders transcript string and copies content', async () => {
    const message = 'Hello world';
    render(<TranscriptionDisplay text={message} />);

    expect(screen.getByText(message)).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /copy to clipboard/i });
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(message);
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });

  it('renders array transcript entries', () => {
    const entries = [{ id: '1', role: 'user', content: 'Hi there', time: '10:00' }];
    render(<TranscriptionDisplay text={entries} />);

    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });
});
