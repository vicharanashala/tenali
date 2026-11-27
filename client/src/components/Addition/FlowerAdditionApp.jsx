import React, { useEffect, useRef } from 'react';

/**
 * FlowerAdditionApp
 *
 * React wrapper component hosting the standalone Flower Addition II learning application
 * inside an isolated same-origin iframe. Communicates with the hosted application via a
 * secure postMessage bridge for lifecycle and navigation events.
 *
 * @param {Object} props
 * @param {Function} [props.onBack] - Callback invoked to return to the Tenali dashboard.
 */
export default function FlowerAdditionApp({ onBack }) {
  const iframeRef = useRef(null);

  // Construct iframe URL respecting Tenali's Vite base path (e.g. '/' or sub-paths like '/matrixmystics/')
  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const iframeSrc = `${basePath}/flower-addition/index.html`;

  useEffect(() => {
    function handleMessage(event) {
      // 1. Validate same-origin
      if (event.origin !== window.location.origin) {
        return;
      }

      // 2. Validate source window is our child iframe
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
        return;
      }

      // 3. Handle navigation back to Tenali dashboard
      if (event.data?.type === 'tenali:back') {
        if (typeof onBack === 'function') {
          onBack();
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onBack]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        title="Tenali Flower Addition II"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          flex: 1,
        }}
        allow="autoplay"
      />
    </div>
  );
}
