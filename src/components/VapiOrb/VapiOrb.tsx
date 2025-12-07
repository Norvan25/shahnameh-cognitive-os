import { useEffect } from 'react';
import './VapiOrb.css';

declare global {
  interface Window {
    vapiSDK?: {
      run: (config: any) => any;
    };
    vapiInstance?: any;
  }
}

// =====================================================
// YOUR VAPI CREDENTIALS
// =====================================================
const VAPI_PUBLIC_KEY = '49e26799-5a5d-490a-9805-e4ee9c4a6fea';
const VAPI_ASSISTANT_ID = '19d88bcb-46d6-4eb3-bb2f-5b966e4019ed';
// =====================================================

export function VapiOrb() {
  useEffect(() => {
    // Add custom styles to override VAPI button appearance
    const style = document.createElement('style');
    style.id = 'vapi-custom-styles';
    style.textContent = `
      /* Override VAPI button styles */
      #vapi-support-btn,
      .vapi-btn,
      [data-vapi-btn] {
        width: 64px !important;
        height: 64px !important;
        border-radius: 50% !important;
        background: linear-gradient(135deg, #66D3FA 0%, #007ACC 100%) !important;
        border: none !important;
        cursor: pointer !important;
        box-shadow: 0 4px 20px rgba(102, 211, 250, 0.4) !important;
        transition: all 0.3s ease !important;
        bottom: 24px !important;
        right: 24px !important;
        position: fixed !important;
        z-index: 100 !important;
      }

      #vapi-support-btn:hover,
      .vapi-btn:hover,
      [data-vapi-btn]:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 6px 30px rgba(102, 211, 250, 0.5) !important;
      }

      /* When call is active - green gradient */
      #vapi-support-btn.vapi-btn-is-active,
      .vapi-btn.vapi-btn-is-active,
      [data-vapi-btn].vapi-btn-is-active,
      #vapi-support-btn[data-active="true"],
      .vapi-btn[data-active="true"] {
        background: linear-gradient(135deg, #009E60 0%, #007ACC 100%) !important;
        box-shadow: 0 4px 20px rgba(0, 158, 96, 0.4) !important;
      }

      /* Style the icon inside */
      #vapi-support-btn svg,
      .vapi-btn svg,
      [data-vapi-btn] svg {
        width: 32px !important;
        height: 32px !important;
        color: white !important;
        fill: white !important;
      }

      #vapi-support-btn img,
      .vapi-btn img,
      [data-vapi-btn] img {
        width: 32px !important;
        height: 32px !important;
        filter: brightness(0) invert(1) !important;
      }

      /* Hide any default VAPI branding/text */
      #vapi-support-btn span,
      .vapi-btn span {
        display: none !important;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        #vapi-support-btn,
        .vapi-btn,
        [data-vapi-btn] {
          width: 56px !important;
          height: 56px !important;
          bottom: 16px !important;
          right: 16px !important;
        }

        #vapi-support-btn svg,
        .vapi-btn svg,
        #vapi-support-btn img,
        .vapi-btn img {
          width: 28px !important;
          height: 28px !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Load VAPI widget SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
    script.defer = true;
    script.async = true;

    script.onload = () => {
      if (window.vapiSDK) {
        window.vapiInstance = window.vapiSDK.run({
          apiKey: VAPI_PUBLIC_KEY,
          assistant: VAPI_ASSISTANT_ID,
          config: {
            position: 'bottom-right',
            offset: '24px',
          },
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      const styleEl = document.getElementById('vapi-custom-styles');
      if (styleEl) styleEl.remove();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // No custom button - VAPI creates its own, we just style it
  return null;
}
