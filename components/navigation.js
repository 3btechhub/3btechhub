/* Floating navigation toggle — theme colors come from the active theme CSS. */
(() => {
  const BUTTON_ID = "site-navigation-toggle";
  const STYLE_ID = "site-navigation-toggle-styles";

  function initializeNavigationToggle() {
    if (document.getElementById(BUTTON_ID)) return;

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        #${BUTTON_ID} {
          position: fixed;
          left: 50%;
          bottom: 20px;
          transform: translateX(-50%);
          z-index: 1000;
          width: 58px;
          height: 58px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--color-border);
          border-radius: 50%;
          background: var(--color-accent);
          color: var(--color-button-primary-text);
          box-shadow: 0 4px 14px 0 var(--shadow-color);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        #${BUTTON_ID}:focus-visible {
          outline: 3px solid var(--color-focus-ring);
          outline-offset: 3px;
        }

        #${BUTTON_ID} svg {
          display: block;
          width: 25px;
          height: 25px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (prefers-reduced-motion: no-preference) {
          #${BUTTON_ID} svg {
            transition: transform 160ms ease;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.setAttribute("aria-label", "Open navigation menu");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    `;

    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      const nextIsOpen = !isOpen;

      button.setAttribute("aria-expanded", String(nextIsOpen));
      button.setAttribute(
        "aria-label",
        nextIsOpen ? "Close navigation menu" : "Open navigation menu"
      );

      button.innerHTML = nextIsOpen
        ? `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
             <path d="M18 6 6 18M6 6l12 12"></path>
           </svg>`
        : `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
             <path d="M4 6h16M4 12h16M4 18h16"></path>
           </svg>`;

      button.dispatchEvent(new CustomEvent("navigation-toggle", {
        bubbles: true,
        detail: { open: nextIsOpen }
      }));
    });

    document.body.appendChild(button);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeNavigationToggle, { once: true });
  } else {
    initializeNavigationToggle();
  }
})();
