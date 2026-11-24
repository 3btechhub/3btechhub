class DashboardTabs extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    this.tabList = this.querySelector('[role="tablist"]');
    this.tabs = [...this.querySelectorAll("[data-dashboard-tab]")];
    this.panels = [...this.querySelectorAll("[data-dashboard-panel]")];

    if (!this.tabList || !this.tabs.length || !this.panels.length) return;

    this.tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => this.activate(tab.dataset.dashboardTab));
      tab.addEventListener("keydown", event => this.handleKeydown(event, index));
    });

    const firstTab = this.tabs[0];
    this.activate(firstTab.dataset.dashboardTab, false);
  }

  activate(key, moveFocus = false) {
    const activeTab = this.tabs.find(tab => tab.dataset.dashboardTab === key);
    const activePanel = this.panels.find(panel => panel.dataset.dashboardPanel === key);
    if (!activeTab || !activePanel) return;

    this.tabs.forEach(tab => {
      const selected = tab === activeTab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      tab.classList.toggle("is-active", selected);
    });

    this.panels.forEach(panel => {
      const selected = panel === activePanel;
      panel.hidden = !selected;
      panel.classList.toggle("is-active", selected);
    });

    if (moveFocus) activeTab.focus();
    activeTab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }

  handleKeydown(event, currentIndex) {
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % this.tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = this.tabs.length - 1;
    else return;

    event.preventDefault();
    this.activate(this.tabs[nextIndex].dataset.dashboardTab, true);
  }
}

if (!customElements.get("dashboard-tabs")) {
  customElements.define("dashboard-tabs", DashboardTabs);
}
