(() => {
  "use strict";
  window.__3bComponents = window.__3bComponents || {};
  window.__3bComponents.visibility = {
    render(container, roles, selectedIds = [], emptyMessage = "No active roles are available.") {
      if (!container) return;
      container.replaceChildren();
      if (!roles?.length) {
        container.textContent = emptyMessage;
        return;
      }
      const selected = new Set(selectedIds || []);
      roles.forEach(role => {
        const label = document.createElement("label");
        label.className = "ui-visibility-option";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "ui-checkbox";
        checkbox.value = role.id;
        checkbox.checked = selected.has(role.id);
        const name = document.createElement("span");
        name.textContent = role.name;
        label.append(checkbox, name);
        container.appendChild(label);
      });
    },
    getSelected(container) {
      return [...(container?.querySelectorAll("input:checked") || [])].map(input => input.value);
    },
    select(container, ids = []) {
      const selected = new Set(ids || []);
      container?.querySelectorAll("input").forEach(input => {
        input.checked = selected.has(input.value);
      });
    },
    visitorRoleIds(roles) {
      return (roles || []).filter(role => role.slug === "visitor").map(role => role.id);
    }
  };
})();
