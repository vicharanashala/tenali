import React, { useRef, useEffect, useState } from 'react';
import { playSound } from './audioContext';

/**
 * ScratchCardModal Component
 * Interactive e-commerce style coupon scratch card modal for revealing educational hints.
 */
export default function ScratchCardModal({ isOpen, hintText, onClose }) {
  const canvasRef = useRef(null);
  const [isScratchingStarted, setIsScratchingStarted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setIsScratchingStarted(false);
      setIsRevealed(false);
      isDrawingRef.current = false;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const width = canvas.width = canvas.offsetWidth || 480;
    const height = canvas.height = canvas.offsetHeight || 200;

    // Draw metallic silver scratch coating
    ctx.globalCompositeOperation = 'source-over';
    
    // Base metallic gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#757c85');
    grad.addColorStop(0.3, '#9ea6b0');
    grad.addColorStop(0.6, '#666d75');
    grad.addColorStop(0.85, '#8e96a0');
    grad.addColorStop(1, '#5a6068');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Add metallic scratch texture lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = -height; i < width + height; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.lineTo(i + height + 4, height);
      ctx.lineTo(i + 4, 0);
      ctx.fill();
    }

    // Add coupon icon pattern overlay on scratch coating
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.font = '16px sans-serif';
    for (let x = 20; x < width; x += 60) {
      for (let y = 30; y < height; y += 45) {
        ctx.fillText('🎟️', x, y);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const checkScratchPercentage = () => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const width = canvas.width;
    const height = canvas.height;
    
    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let clearCount = 0;
      const totalPixels = data.length / 4;
      
      // Sample every 4th pixel for performance
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] === 0) {
          clearCount += 4;
        }
      }

      const percent = clearCount / totalPixels;
      if (percent >= 0.50) {
        // Auto reveal remaining surface
        ctx.clearRect(0, 0, width, height);
        setIsRevealed(true);
        playSound('correct');
      }
    } catch (e) {
      console.warn('Canvas scratch calculation failed:', e);
    }
  };

  const scratch = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (!isScratchingStarted) {
      setIsScratchingStarted(true);
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2, false);
    ctx.fill();

    checkScratchPercentage();
  };

  const handleMouseDown = (e) => {
    isDrawingRef.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    checkScratchPercentage();
  };

  const handleTouchStart = (e) => {
    isDrawingRef.current = true;
    if (e.touches && e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDrawingRef.current) return;
    if (e.touches && e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
    checkScratchPercentage();
  };

  return (
    <div
      className="tmr-scratch-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        animation: 'scratchFadeIn 0.25s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="tmr-scratch-modal"
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#1f1914',
          border: '1.5px solid rgba(217, 125, 56, 0.4)',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(217, 125, 56, 0.15)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            playSound('click');
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#a89a8e',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title="Close Hint"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '6px' }}>
            <span style={{ fontSize: '2.4rem', filter: 'drop-shadow(0 0 10px rgba(245, 166, 35, 0.6))' }}>💡</span>
            <span style={{ position: 'absolute', top: '-4px', right: '-8px', fontSize: '0.9rem' }}>✨</span>
            <span style={{ position: 'absolute', bottom: '0px', left: '-10px', fontSize: '0.8rem' }}>✨</span>
          </div>
          <h2 style={{ margin: '0 0 4px 0', fontFamily: 'Georgia, serif', color: '#ffffff', fontSize: '1.5rem', fontWeight: '700' }}>
            Your Hint
          </h2>
          <p style={{ margin: 0, color: '#a89a8e', fontSize: '0.88rem', fontWeight: '500' }}>
            Scratch the card below to reveal your hint!
          </p>
        </div>

        {/* Scratch Card Outer Frame */}
        <div
          style={{
            width: '100%',
            height: '210px',
            borderRadius: '18px',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid #d97d38',
            boxShadow: '0 0 24px rgba(217, 125, 56, 0.3), inset 0 0 15px rgba(0, 0, 0, 0.5)',
            backgroundColor: '#16110d',
            cursor: isRevealed ? 'default' : 'pointer'
          }}
        >
          {/* Underneath Layer: Revealed Hint Content */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              backgroundColor: '#1c1611',
              backgroundImage: 'radial-gradient(circle at center, rgba(217, 125, 56, 0.15) 0%, transparent 70%)',
              boxSizing: 'border-box'
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#ffffff',
                fontSize: '1.08rem',
                fontWeight: '600',
                lineHeight: 1.5,
                textAlign: 'center',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
              }}
            >
              {hintText || 'Think about numbers that cannot be divided into two equal groups.'}
            </p>
          </div>

          {/* Canvas Scratch Layer */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              touchAction: 'none',
              transition: isRevealed ? 'opacity 0.4s ease-out' : 'none',
              opacity: isRevealed ? 0 : 1,
              pointerEvents: isRevealed ? 'none' : 'auto'
            }}
          />

          {/* Initial Scratch Prompt Indicator */}
          {!isScratchingStarted && !isRevealed && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                color: '#ffffff',
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
                zIndex: 2,
                animation: 'scratchPromptPulse 1.8s ease-in-out infinite'
              }}
            >
              <span style={{ fontSize: '2rem' }}>👆</span>
              <span style={{ fontSize: '0.92rem', fontWeight: '700', letterSpacing: '0.04em' }}>
                Scratch here
              </span>
            </div>
          )}
        </div>

        {/* Footer Tip */}
        <div style={{ marginTop: '16px', color: '#a89a8e', fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>✨</span>
          <span>Tip: Use your mouse or touch to scratch</span>
        </div>
      </div>
    </div>
  );
}
