import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RecordButton from '../RecordButton';

const defineMediaDevices = (value) => {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    writable: true,
    value,
  });
};

describe('RecordButton', () => {
  let originalMediaRecorder;
  let originalMediaDevicesDescriptor;
  let originalAlert;

  beforeEach(() => {
    originalMediaRecorder = window.MediaRecorder;
    originalMediaDevicesDescriptor = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');
    originalAlert = window.alert;
    window.alert = vi.fn();
  });

  afterEach(() => {
    window.MediaRecorder = originalMediaRecorder;
    if (originalMediaDevicesDescriptor) {
      Object.defineProperty(navigator, 'mediaDevices', originalMediaDevicesDescriptor);
    } else {
      delete navigator.mediaDevices;
    }
    window.alert = originalAlert;
    vi.restoreAllMocks();
  });

  it('shows unsupported message when recording APIs are missing', async () => {
    window.MediaRecorder = undefined;
    defineMediaDevices(undefined);

    render(<RecordButton />);

    expect(
      await screen.findByText('Recording is not supported in this browser.')
    ).toBeInTheDocument();
  });

  it('invokes onFileReady after completing a recording session', async () => {
    const trackStop = vi.fn();
    const stream = {
      getTracks: () => [{ stop: trackStop }],
    };
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    defineMediaDevices({ getUserMedia });

    let recorderInstance;
    class MockMediaRecorder {
      constructor() {
        this.ondataavailable = null;
        this.onstop = null;
        recorderInstance = this;
        this.mimeType = 'audio/webm;codecs=opus';
      }

      start() {}

      stop() {
        this.onstop?.();
      }

      static isTypeSupported() {
        return true;
      }
    }

    window.MediaRecorder = MockMediaRecorder;

    const onFileReady = vi.fn();
    render(<RecordButton onFileReady={onFileReady} />);

    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await screen.findByRole('button', { name: /stop recording/i });
    expect(getUserMedia).toHaveBeenCalled();

    recorderInstance.ondataavailable?.({
      data: new Blob(['sample'], { type: 'audio/webm' }),
    });

    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

    await waitFor(() => {
      expect(onFileReady).toHaveBeenCalledTimes(1);
    });

    const file = onFileReady.mock.calls[0][0];
    expect(file).toBeInstanceOf(File);
    expect(file.type).toBe('audio/webm;codecs=opus');
    expect(file.name).toBe('recording.webm');
    expect(trackStop).toHaveBeenCalled();
  });
});
