/**
 * Floating navigation component.
 *
 * Usage:
 * import mountNavigation from "./shared-component/navigation.js";
 * mountNavigation({
 *   items: [{ label: "Home", href: "/" }, { label: "Account", href: "/account" }]
 * });
 */

export default function mountNavigation({ items = [] } = {}) {
  const root = document.createElement("div");
  root.className = "shared-navigation";
  root.innerHTML = `
    <div class="shared-navigation__list" hidden></div>
    <button
      class="shared-navigation__toggle"
      type="button"
      aria-label="Open menu"
      aria-expanded="false"
    >
      <svg class="shared-navigation__menu-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <svg class="shared-navigation__close-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    </button>
  `;

  const styleId = "shared-navigation-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .shared-navigation {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 12px;
        font: inherit;
      }
      .shared-navigation__toggle {
        width: 54px;
        height: 54px;
        display: grid;
        place-items: center;
        padding: 0;
        border: 1px solid #000;
        border-radius: 50%;
        background: #fff;
        color: #000;
        cursor: pointer;
        box-shadow: 0 2px 10px rgb(0 0 0 / 15%);
      }
      .shared-navigation__toggle svg {
        width: 24px;
        height: 24px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
      }
      .shared-navigation__close-icon { display: none; }
      .shared-navigation.is-open .shared-navigation__menu-icon { display: none; }
      .shared-navigation.is-open .shared-navigation__close-icon { display: block; }
      .shared-navigation__list {
        min-width: 170px;
        max-width: min(260px, calc(100vw - 40px));
        padding: 8px;
        border: 1px solid #000;
        border-radius: 12px;
        background: #fff;
        color: #000;
        box-shadow: 0 2px 14px rgb(0 0 0 / 16%);
      }
      .shared-navigation__list[hidden] { display: none; }
      .shared-navigation__item {
        display: block;
        padding: 11px 14px;
        border-radius: 7px;
        color: inherit;
        text-decoration: none;
      }
      .shared-navigation__item:hover,
      .shared-navigation__item:focus-visible {
        background: #f0f0f0;
        outline: none;
      }
      @media (max-width: 480px) {
        .shared-navigation { right: 16px; bottom: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  const list = root.querySelector(".shared-navigation__list");
  const toggle = root.querySelector(".shared-navigation__toggle");

  items.forEach((item) => {
    if (!item || typeof item.label !== "string" || typeof item.href !== "string") return;
    const link = document.createElement("a");
    link.className = "shared-navigation__item";
    link.textContent = item.label;
    link.href = item.href;
    link.addEventListener("click", closeMenu);
    list.appendChild(link);
  });

  function openMenu() {
    root.classList.add("is-open");
    list.hidden = false;
    toggle.setAttribute("aria-label", "Close menu");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    root.classList.remove("is-open");
    list.hidden = true;
    toggle.setAttribute("aria-label", "Open menu");
    toggle.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    if (root.classList.contains("is-open")) closeMenu();
    else openMenu();
  }

  function handleOutsideTap(event) {
    if (!root.contains(event.target)) closeMenu();
  }

  toggle.addEventListener("click", toggleMenu);
  document.addEventListener("pointerdown", handleOutsideTap);
  document.body.appendChild(root);

  return {
    element: root,
    open: openMenu,
    close: closeMenu,
    destroy() {
      document.removeEventListener("pointerdown", handleOutsideTap);
      toggle.removeEventListener("click", toggleMenu);
      root.remove();
    }
  };
}
