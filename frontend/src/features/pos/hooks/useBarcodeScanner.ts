'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePosStore } from '../usePosStore';
import { useProductStore } from '@/features/product/useProductStore';
import { Product, ProductUnit } from '@/features/product/product.types';

export interface ScanFeedback {
  type: 'success' | 'error';
  barcode: string;
  message: string;
  productName?: string;
  unitName?: string;
  price?: number;
  timestamp: number;
}

interface KeyStroke {
  char: string;
  timestamp: number;
}

/**
 * High-speed hardware barcode scanner listener.
 * Detects rapid keystroke bursts (< 50ms per character) emitted by USB/Bluetooth
 * barcode guns, automatically locates the matching product/variant, increments the cart,
 * and triggers crisp audio/visual feedback.
 */
export function useBarcodeScanner() {
  const { addItem } = usePosStore();
  const { products } = useProductStore();
  const [lastScan, setLastScan] = useState<ScanFeedback | null>(null);
  const [isScannerReady, setIsScannerReady] = useState(true);

  const bufferRef = useRef<KeyStroke[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Play crisp positive beep on scan success
  const playSuccessTone = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 crisp beep
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio playback may require initial user click in some browsers
    }
  }, []);

  // Play low error buzz when barcode is not recognized
  const playErrorTone = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3 low buzz
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {
      // Audio playback fallback
    }
  }, []);

  // Match scanned barcode against catalog
  const handleBarcodeScanned = useCallback(
    (code: string) => {
      const cleanCode = code.trim();
      if (!cleanCode) return;

      let matchedProduct: Product | null = null;
      let matchedUnit: ProductUnit | undefined = undefined;

      // 1. Direct match on product barcode or SKU
      for (const p of products) {
        if (
          (p.barcode && p.barcode.toLowerCase() === cleanCode.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase() === cleanCode.toLowerCase())
        ) {
          matchedProduct = p;
          break;
        }

        // 2. Check variants
        if (p.variants && p.variants.length > 0) {
          for (const v of p.variants) {
            if (
              (v.barcode && v.barcode.toLowerCase() === cleanCode.toLowerCase()) ||
              (v.sku && v.sku.toLowerCase() === cleanCode.toLowerCase())
            ) {
              matchedProduct = p;
              // Check if variant has a default unit or matching unit
              if (v.units && v.units.length > 0) {
                matchedUnit = v.units.find((u) => u.isDefault) || v.units[0];
              }
              break;
            }

            // 3. Check unit-level barcodes (e.g. 50kg sack barcode vs 1kg packet)
            if (v.units && v.units.length > 0) {
              const uMatch = v.units.find(
                (u) => u.barcode && u.barcode.toLowerCase() === cleanCode.toLowerCase()
              );
              if (uMatch) {
                matchedProduct = p;
                matchedUnit = uMatch;
                break;
              }
            }
          }
        }

        if (matchedProduct) break;
      }

      if (matchedProduct) {
        // Add to cart
        addItem(matchedProduct, matchedUnit, 1);
        playSuccessTone();

        const unitName = matchedUnit ? matchedUnit.unitName : matchedProduct.baseUnitName;
        const feedback: ScanFeedback = {
          type: 'success',
          barcode: cleanCode,
          message: `${matchedProduct.banglaName || matchedProduct.name} কার্টে যোগ হয়েছে`,
          productName: matchedProduct.banglaName || matchedProduct.name,
          unitName,
          timestamp: Date.now(),
        };
        setLastScan(feedback);

        // Auto clear toast after 3 seconds
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setLastScan((current) => (current?.timestamp === feedback.timestamp ? null : current));
        }, 3000);
      } else {
        // Not found
        playErrorTone();
        const feedback: ScanFeedback = {
          type: 'error',
          barcode: cleanCode,
          message: `বারকোড পাওয়া যায়নি: ${cleanCode}`,
          timestamp: Date.now(),
        };
        setLastScan(feedback);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setLastScan((current) => (current?.timestamp === feedback.timestamp ? null : current));
        }, 3500);
      }
    },
    [products, addItem, playSuccessTone, playErrorTone]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore functional control keys
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
        return;
      }

      const now = performance.now();
      const buffer = bufferRef.current;

      if (e.key === 'Enter') {
        // Evaluate if this sequence arrived with scanner-like speed (< 60ms average interval)
        if (buffer.length >= 3) {
          const firstTime = buffer[0].timestamp;
          const totalDuration = now - firstTime;
          const avgInterval = totalDuration / buffer.length;

          // Hardware scanners output characters at < 45ms intervals
          if (avgInterval < 65) {
            e.preventDefault();
            e.stopPropagation();

            const code = buffer.map((b) => b.char).join('');
            bufferRef.current = [];
            handleBarcodeScanned(code);
            return;
          }
        }
        // If it wasn't a fast scanner burst, clear buffer
        bufferRef.current = [];
        return;
      }

      // Single printable character
      if (e.key.length === 1) {
        if (buffer.length > 0) {
          const lastTime = buffer[buffer.length - 1].timestamp;
          // If pause is more than 80ms, the previous burst is stale (human typing or new scan)
          if (now - lastTime > 80) {
            bufferRef.current = [{ char: e.key, timestamp: now }];
            return;
          }
        }
        bufferRef.current.push({ char: e.key, timestamp: now });
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [handleBarcodeScanned]);

  return {
    lastScan,
    isScannerReady,
    dismissScanFeedback: () => setLastScan(null),
    triggerManualScan: handleBarcodeScanned,
  };
}
