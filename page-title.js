(() => {
  const pageName = document.body.dataset.pageTitle;
  if (!pageName) return;

  const heading = document.createElement("h1");
  heading.id = "site-page-title";
  heading.textContent = pageName;
  heading.setAttribute("aria-label", pageName);

  const style = document.createElement("style");
  style.textContent = `
    #site-page-title {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 900;
      width: max-content;
      max-width: calc(100vw - 32px);
      margin: 0;
      color: #111827;
      font-family: system-ui, sans-serif;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.3;
      text-align: center;
      overflow-wrap: anywhere;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(heading);
})();