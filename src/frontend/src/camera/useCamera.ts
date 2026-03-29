import { useCallback, useEffect, useRef, useState } from "react";

export interface CameraConfig {
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
  quality?: number;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export interface CameraError {
  type: "permission" | "not-supported" | "not-found" | "unknown";
  message: string;
  hint?: string;
}

/**
 * Maps a browser camera error to a user-friendly CameraError object.
 * Defined outside the hook so it is a stable reference.
 */
function buildError(err: any): CameraError {
  if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
    return {
      type: "permission",
      message: "Camera permission denied.",
      hint: "Open your browser / OS settings, allow camera access for this site, then tap Retry.",
    };
  }
  if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
    return {
      type: "not-found",
      message: "No camera found on this device.",
      hint: "Make sure a camera is connected and not in use by another app.",
    };
  }
  if (err.name === "NotReadableError" || err.name === "TrackStartError") {
    return {
      type: "unknown",
      message: "Camera is in use by another application.",
      hint: "Close other apps using the camera, then tap Retry.",
    };
  }
  if (
    err.name === "OverconstrainedError" ||
    err.name === "ConstraintNotSatisfiedError"
  ) {
    return {
      type: "not-found",
      message: "Camera could not satisfy the requested constraints.",
      hint: "Try switching to a different camera or use the Upload option.",
    };
  }
  if (err.name === "NotSupportedError") {
    return {
      type: "not-supported",
      message: "Camera not supported in this browser.",
      hint: "Try Chrome, Firefox, or Safari on a supported device.",
    };
  }
  return {
    type: "unknown",
    message: err.message || "Failed to access camera.",
    hint: "Tap Retry or use the Upload option instead.",
  };
}

/**
 * Attempts to get a MediaStream using progressively relaxed constraints.
 * Strategy:
 *  1. Requested facingMode with ideal resolution
 *  2. Opposite facingMode with ideal resolution
 *  3. No facingMode constraint (works on laptops, Raspberry Pi, USB webcams)
 *  4. Minimal: { video: true }
 *
 * Permission errors abort early (no point trying other strategies).
 */
async function getStreamWithFallback(
  facingMode: "user" | "environment",
  width: number,
  height: number,
): Promise<MediaStream> {
  const opposite = facingMode === "environment" ? "user" : "environment";

  const strategies: MediaStreamConstraints[] = [
    {
      video: { facingMode, width: { ideal: width }, height: { ideal: height } },
    },
    {
      video: {
        facingMode: opposite,
        width: { ideal: width },
        height: { ideal: height },
      },
    },
    { video: { width: { ideal: width }, height: { ideal: height } } },
    { video: true },
  ];

  let lastError: any = null;
  for (const constraints of strategies) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err: any) {
      lastError = err;
      // Permission denied — no point trying other strategies
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        throw err;
      }
    }
  }
  throw lastError;
}

export const useCamera = (config: CameraConfig = {}) => {
  const {
    facingMode = "environment",
    quality = 0.8,
    format = "image/jpeg",
  } = config;

  // Resolve initial dimensions used in fallback strategies
  const width = config.width ?? 1920;
  const height = config.height ?? 1080;

  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<CameraError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFacingMode, setCurrentFacingMode] = useState<
    "user" | "environment"
  >(facingMode);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const supported = !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    );
    setIsSupported(supported);
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsActive(false);
  }, []);

  const setupVideo = useCallback(
    async (stream: MediaStream): Promise<boolean> => {
      if (!videoRef.current) return false;
      const video = videoRef.current;
      video.srcObject = stream;

      return new Promise<boolean>((resolve) => {
        const onLoaded = () => {
          video.removeEventListener("loadedmetadata", onLoaded);
          video.removeEventListener("error", onErr);
          video.play().catch(() => {
            /* autoplay may require user gesture — non-fatal */
          });
          resolve(true);
        };
        const onErr = () => {
          video.removeEventListener("loadedmetadata", onLoaded);
          video.removeEventListener("error", onErr);
          resolve(false);
        };
        video.addEventListener("loadedmetadata", onLoaded);
        video.addEventListener("error", onErr);
        if (video.readyState >= 1) onLoaded();
      });
    },
    [],
  );

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (isSupported === false || isLoading) return false;

    setIsLoading(true);
    setError(null);

    try {
      cleanup();

      const stream = await getStreamWithFallback(
        currentFacingMode,
        width,
        height,
      );

      if (!isMountedRef.current) {
        for (const track of stream.getTracks()) track.stop();
        return false;
      }

      // Detect actual facing mode from track settings
      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings?.() as any;
      if (
        settings?.facingMode === "user" ||
        settings?.facingMode === "environment"
      ) {
        setCurrentFacingMode(settings.facingMode);
      }

      streamRef.current = stream;
      const success = await setupVideo(stream);

      if (success && isMountedRef.current) {
        setIsActive(true);
        return true;
      }

      cleanup();
      return false;
    } catch (err: any) {
      if (isMountedRef.current) setError(buildError(err));
      cleanup();
      return false;
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [
    isSupported,
    isLoading,
    currentFacingMode,
    cleanup,
    setupVideo,
    width,
    height,
  ]);

  const stopCamera = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    cleanup();
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (isMountedRef.current) setIsLoading(false);
  }, [isLoading, cleanup]);

  const switchCamera = useCallback(
    async (newFacingMode?: "user" | "environment"): Promise<boolean> => {
      if (isSupported === false || isLoading) return false;

      const next: "user" | "environment" =
        newFacingMode ??
        (currentFacingMode === "user" ? "environment" : "user");

      setIsLoading(true);
      setError(null);

      try {
        cleanup();
        setCurrentFacingMode(next);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const stream = await getStreamWithFallback(next, width, height);

        if (!isMountedRef.current) {
          for (const track of stream.getTracks()) track.stop();
          return false;
        }

        streamRef.current = stream;
        const success = await setupVideo(stream);

        if (success && isMountedRef.current) {
          setIsActive(true);
          return true;
        }

        cleanup();
        return false;
      } catch (err: any) {
        if (isMountedRef.current) setError(buildError(err));
        cleanup();
        return false;
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [
      isSupported,
      isLoading,
      currentFacingMode,
      cleanup,
      setupVideo,
      width,
      height,
    ],
  );

  const retry = useCallback(async (): Promise<boolean> => {
    if (isLoading) return false;
    setError(null);
    await stopCamera();
    await new Promise((resolve) => setTimeout(resolve, 200));
    return startCamera();
  }, [isLoading, stopCamera, startCamera]);

  const capturePhoto = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current || !isActive) {
        resolve(null);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      if (currentFacingMode === "user") {
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0);
      } else {
        ctx.drawImage(video, 0, 0);
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const ext = format.split("/")[1];
            resolve(
              new File([blob], `photo_${Date.now()}.${ext}`, { type: format }),
            );
          } else {
            resolve(null);
          }
        },
        format,
        quality,
      );
    });
  }, [isActive, format, quality, currentFacingMode]);

  return {
    isActive,
    isSupported,
    error,
    isLoading,
    currentFacingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    retry,
    videoRef,
    canvasRef,
  };
};
