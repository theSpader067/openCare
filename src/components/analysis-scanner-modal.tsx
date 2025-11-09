"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Camera, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Tesseract from "tesseract.js";

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: { imageUrl: string; extractedText: string }) => void;
  testLabels?: string[];
}

export function AnalysisScannerModal({
  isOpen,
  onClose,
  onScan,
  testLabels = [],
}: ScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [step, setStep] = useState<"camera" | "preview" | "ocr">("camera");
  const [processingMessage, setProcessingMessage] = useState("");

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageUrl = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(imageUrl);
        stopCamera();
        setStep("preview");
      }
    }
  }, [stopCamera]);

  // Advanced preprocessing optimized for medical lab documents
  const enhanceImage = (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        // Draw the original image
        ctx.drawImage(img, 0, 0);

        // Get image data
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = imageData.data;

        // Step 1: Convert to grayscale and enhance for medical documents
        const grayData = new Uint8ClampedArray(data.length);
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          grayData[i] = gray;
          grayData[i + 1] = gray;
          grayData[i + 2] = gray;
          grayData[i + 3] = data[i + 3]; // Keep alpha
        }

        // Step 2: Apply adaptive contrast for better text clarity
        for (let i = 0; i < grayData.length; i += 4) {
          let pixel = grayData[i];
          // Strong contrast enhancement for medical text
          let enhanced = (pixel - 128) * 2.0 + 128;
          enhanced = Math.max(0, Math.min(255, enhanced));

          // Slight brightness boost
          enhanced += 10;
          enhanced = Math.max(0, Math.min(255, enhanced));

          grayData[i] = enhanced;
          grayData[i + 1] = enhanced;
          grayData[i + 2] = enhanced;
        }

        // Step 3: Apply Otsu's binarization for crisp text (critical for medical documents)
        const threshold = calculateOtsuThreshold(grayData);
        for (let i = 0; i < grayData.length; i += 4) {
          const binarized = grayData[i] > threshold ? 255 : 0;
          grayData[i] = binarized;
          grayData[i + 1] = binarized;
          grayData[i + 2] = binarized;
        }

        // Step 4: Apply morphological operations (dilation + erosion) for noise reduction
        const dilated = morphDilate(grayData, canvas.width, canvas.height);
        const eroded = morphErode(dilated, canvas.width, canvas.height);

        // Put processed image back
        imageData.data.set(eroded);
        ctx.putImageData(imageData, 0, 0);

        resolve(canvas.toDataURL("image/png", 0.95));
      };
      img.src = imageUrl;
    });
  };

  // Calculate Otsu's threshold for optimal binarization
  const calculateOtsuThreshold = (data: Uint8ClampedArray): number => {
    const histogram = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      histogram[data[i]]++;
    }

    let total = data.length / 4;
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * histogram[i];
    }

    let sumB = 0;
    let wB = 0;
    let maxVariance = 0;
    let threshold = 0;

    for (let i = 0; i < 256; i++) {
      wB += histogram[i];
      if (wB === 0) continue;

      const wF = total - wB;
      if (wF === 0) break;

      sumB += i * histogram[i];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const variance = wB * wF * (mB - mF) * (mB - mF);

      if (variance > maxVariance) {
        maxVariance = variance;
        threshold = i;
      }
    }

    return threshold;
  };

  // Morphological dilation for connecting text components
  const morphDilate = (data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
    const result = new Uint8ClampedArray(data);
    const kernel = 1; // 1-pixel kernel

    for (let y = kernel; y < height - kernel; y++) {
      for (let x = kernel; x < width - kernel; x++) {
        const idx = (y * width + x) * 4;

        // Check 8-neighborhood
        let isWhite = false;
        for (let dy = -kernel; dy <= kernel; dy++) {
          for (let dx = -kernel; dx <= kernel; dx++) {
            const nidx = ((y + dy) * width + (x + dx)) * 4;
            if (data[nidx] > 128) {
              isWhite = true;
              break;
            }
          }
          if (isWhite) break;
        }

        if (isWhite) {
          result[idx] = 255;
          result[idx + 1] = 255;
          result[idx + 2] = 255;
        }
      }
    }

    return result;
  };

  // Morphological erosion for noise removal
  const morphErode = (data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
    const result = new Uint8ClampedArray(data);
    const kernel = 1;

    for (let y = kernel; y < height - kernel; y++) {
      for (let x = kernel; x < width - kernel; x++) {
        const idx = (y * width + x) * 4;

        // Check 8-neighborhood
        let allWhite = true;
        for (let dy = -kernel; dy <= kernel; dy++) {
          for (let dx = -kernel; dx <= kernel; dx++) {
            const nidx = ((y + dy) * width + (x + dx)) * 4;
            if (data[nidx] < 128) {
              allWhite = false;
              break;
            }
          }
          if (!allWhite) break;
        }

        if (!allWhite) {
          result[idx] = 0;
          result[idx + 1] = 0;
          result[idx + 2] = 0;
        }
      }
    }

    return result;
  };

  const performOCR = useCallback(async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setProcessingMessage("Traitement optimisé pour documents médicaux...");

    try {
      // Enhance the image with medical-optimized preprocessing
      // This includes: grayscale, adaptive contrast, Otsu binarization, morphological operations
      const enhancedImage = await enhanceImage(capturedImage);

      setProcessingMessage("Reconnaissance du texte et des nombres...");

      // Perform OCR with optimized settings for medical documents
      const result = await Tesseract.recognize(
        enhancedImage,
        'fra+eng', // Support both French and English
        {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setProcessingMessage(`Reconnaissance en cours... ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      const text = result.data.text;
      console.log("OCR Extracted Text:", text); // Debug log

      if (!text || text.trim().length === 0) {
        alert("Aucun texte détecté. Essayez de prendre une photo plus nette et bien éclairée.");
        setIsProcessing(false);
        setProcessingMessage("");
        return;
      }

      setExtractedText(text);
      setStep("ocr");
      // Don't call onScan here - wait for user confirmation
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Erreur lors de la reconnaissance de texte. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
      setProcessingMessage("");
    }
  }, [capturedImage]);

  const handleConfirmExtraction = () => {
    if (extractedText && capturedImage) {
      onScan({
        imageUrl: capturedImage,
        extractedText: extractedText,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setExtractedText("");
    setStep("camera");
    setIsProcessing(false);
    setProcessingMessage("");
    onClose();
  };

  // Start camera when modal opens and step is "camera"
  useEffect(() => {
    if (isOpen && step === "camera" && !isCameraActive) {
      startCamera();
    }
  }, [isOpen, step, isCameraActive, startCamera]);

  // Cleanup: stop camera when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-auto">
        <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Scanner d'analyse de laboratoire
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            {step === "camera" && (
              <div className="space-y-4">
                <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Initialisation de la caméra...</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-600 text-center">
                  Orientez l'appareil photo vers le formulaire d'analyse de laboratoire
                </p>
              </div>
            )}

            {step === "preview" && capturedImage && (
              <div className="space-y-4">
                <div className="relative w-full aspect-video bg-slate-100 rounded-2xl overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm text-slate-600 text-center">
                  Image capturée. Cliquez sur "Extraire les données" pour reconnaître le texte.
                </p>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {processingMessage}
                    </p>
                    <p className="text-xs text-slate-500">
                      Veuillez patienter...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === "ocr" && !isProcessing && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-2xl bg-indigo-50 border border-indigo-200 p-4">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-indigo-900">
                      Texte extrait avec succès
                    </p>
                    <p className="text-sm text-indigo-700 mt-1">
                      Vérifiez le texte ci-dessous avant de l'appliquer au formulaire.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Texte extrait de l'image
                  </p>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 max-h-96 overflow-y-auto">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                      {extractedText}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    💡 Si le texte semble incorrect, cliquez sur "Reprendre la photo". Sinon, cliquez sur "Confirmer" pour remplir automatiquement les champs.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-4 py-3 sm:px-6 sm:py-4 flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Annuler
            </Button>

            {step === "camera" && (
              <Button
                variant="primary"
                size="sm"
                onClick={captureImage}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Capturer
              </Button>
            )}

            {step === "preview" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCapturedImage(null);
                    setStep("camera");
                    startCamera();
                  }}
                  disabled={isProcessing}
                >
                  Reprendre
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={performOCR}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <span>Extraire les données</span>
                    </>
                  )}
                </Button>
              </>
            )}

            {step === "ocr" && !isProcessing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCapturedImage(null);
                    setExtractedText("");
                    setStep("camera");
                    startCamera();
                  }}
                >
                  Reprendre
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmExtraction}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
