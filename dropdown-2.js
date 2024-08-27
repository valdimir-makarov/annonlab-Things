class Dropdown extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.render({});
  
      this.dropdownPlaceholder = document.querySelector("#CUSTOM_DROPDOWN_PLACEHOLDER");
      if (!this.dropdownPlaceholder) {
        document.body.insertAdjacentHTML("beforeend", `
          <div id="CUSTOM_DROPDOWN_PLACEHOLDER"></div>
        `);
        this.dropdownPlaceholder = document.querySelector("#CUSTOM_DROPDOWN_PLACEHOLDER");
      }
  //////-1
  
  
      this.openDropdown = ({ component }) => {
        if (this.dropdownPlaceholder?.children?.length) return this.closeDropdown();
        this.dropdownPlaceholder.appendChild(component);
        const options = Array.from(component.querySelectorAll("x-dropdown-option"));
        Array.from(this.children[0].children).forEach(el => {
          const selectedOp = options.find(op => el.getAttribute("data-ref") === op.getAttribute("value"));
          if (selectedOp) {
            selectedOp.setAttribute("data-active", "true");
          }
        })
        setTimeout(() => {
          const prevStyles = component?.getAttribute("style");
          component.setAttribute("style", `
            ${prevStyles}
            z-index: 99999;
            opacity: 1;
            transform: translateY(0px);
          `);
        }, 0);
      }
  
      this.closeDropdown = () => {
        const node = this.dropdownPlaceholder.lastElementChild;
        const prevStyles = node.getAttribute("style");
        node.setAttribute("style", `
          ${prevStyles}
          opacity: 0;
          transform: translateY(10px);
        `);
        node.addEventListener("transitionend", (e) => {
          if (e.propertyName === "transform") {
            this.dropdownPlaceholder.removeChild(node);
          }
        })
      }
  
      if (!window?.["CUSTOM_DROPDOWN"]) {
        window["CUSTOM_DROPDOWN"] = {
          closeDropdown: this.closeDropdown
        }
      }
    }
  
    render(props) {
      this.shadowRoot.innerHTML = `
        <style>${this.css()}</style>
        ${this.template(props)}
      `;
    }
  
    template() {
      return `
        <slot></slot>
      `;
    }
  
    css() {
      return `
        width: 100%;
        display: inline-flex;
      `;
    }
  
    static get observedAttributes() {
      return ["style", "class", "multi", "value", "fluid", "position"];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = {
        oldValue,
        newValue,
      }
    }
  
    set style({ newValue }) {
      setTimeout(() => {
        this.querySelector("x-dropdown-trigger")?.setAttribute("style", newValue);
      }, 0);
    }
  
    set class({ newValue }) {
      setTimeout(() => {
        this.querySelector("x-dropdown-trigger")?.setAttribute("class", newValue);
      }, 0);
    }
  
    set multi({ newValue }) {
      setTimeout(() => {
        this.querySelector("x-dropdown-trigger")?.setAttribute("multi", newValue);
        this.querySelector("x-dropdown-options")?.setAttribute("multi", newValue);
      }, 0);
    }
  
    set fluid({ newValue }) {
      setTimeout(() => {
        this.querySelector("x-dropdown-trigger")?.setAttribute("fluid", newValue);
        this.querySelector("x-dropdown-options")?.setAttribute("fluid", newValue);
      }, 0);
    }
  
    set position({ newValue }) {
      setTimeout(() => {
        this.querySelector("x-dropdown-trigger")?.setAttribute("position", newValue);
        this.querySelector("x-dropdown-options")?.setAttribute("position", newValue);
      }, 0);
    }
  
    set value({ newValue }) {
      setTimeout(() => {
        const placeholder = this.querySelector("x-dropdown-placeholder");
        const insertableElements = newValue.split(",").map(value => Array.from(this.querySelectorAll("x-dropdown-option")).find(el => el.getAttribute("value") === value));
        const isMulti = this.getAttribute("multi") !== null;
        const html = insertableElements.filter(Boolean).map(item => placeholder.preparePlaceholderNode({
          refData: item?.getAttribute("value"),
          component: item?.querySelector("x-dropdown-showable")?.innerHTML || item?.innerHTML,
          isMulti: isMulti
        })).join("") || placeholder?.getAttribute("placeholder");
        placeholder.innerHTML = html;
        if (isMulti) {
          Array.from(placeholder.children).forEach(el => {
            el?.children?.[1]?.addEventListener("click", (e) => {
              e.stopImmediatePropagation();
              placeholder.removeSelected(placeholder, el);
              placeholder.dispatchEvent(placeholder);
            })
          });
        }
      }, 0);
    }
  }
  customElements.define('x-dropdown', Dropdown);
  class DropdownTrigger extends Dropdown {
    constructor() {
      super();
      this.render({});
  
      this.shadowRoot.querySelector("button")?.addEventListener("click", (e) => {
        const buttonEl = this.shadowRoot.querySelector("button");
        const { top, height, left, width, right } = buttonEl.getBoundingClientRect() || {};
        const node = this.nextElementSibling.cloneNode(true);
        const isNonFluid = node.getAttribute("fluid") === "false";
        const shouldShowInRightPosition = node.getAttribute("position") === "right";
        node.setAttribute("data-ref", `'${JSON.stringify(this.getBoundingClientRect())}'`);
        const popperWidth = isNonFluid ? 320 : width;
        node.setAttribute("style", `
          width: ${isNonFluid ? "auto" : width + "px"};
          max-width: ${isNonFluid ? "320px" : width + "px"};
          display: flex;
          position: fixed;
          top: ${top + height + 5}px;
          left: ${shouldShowInRightPosition ? left + width - popperWidth + "px" : left + "px"};
          z-index: -1;
          opacity: 0;
          transition: transform .4s ease-in-out,
                      opacity .4s ease-in-out;
          transform: translateY(10px);
          background: hsl(var(--background-secondary));
        `);
        this.openDropdown({
          component: node
        })
      });
    }
  
    render(props) {
      this.shadowRoot.innerHTML = `
        <style>${this.css()}</style>
        ${this.template(props)}
      `;
    }
  
    template() {
      return `
        <button type="button"><slot></slot></button>
      `;
    }
  
    css() {
      return `
        :host {
          width: 100%;
          display: inline-flex;
        }
        
        :host > button {
          width: 100%;
          box-sizing: border-box;
          background: hsl(var(--background-secondary));
          border: 1px solid hsl(var(--border));
          height: var(--size);
          border-radius: var(--radius);
          outline: none;
          font-size: .9rem;
          font-weight: 500;
          color: hsl(var(--foreground));
          cursor: pointer;
          padding: 0;
        }
      `;
    }
  
    static get observedAttributes() {
      return ["style", "class"];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = {
        oldValue,
        newValue,
      }
    }
  
    set style({ newValue }) {
      this.shadowRoot.querySelector("button")?.setAttribute("style", newValue);
    }
  
    set class({ newValue }) {
      this.shadowRoot.querySelector("button")?.setAttribute("class", newValue);
    }
  }
  customElements.define('x-dropdown-trigger', DropdownTrigger);
  
  
  class DropdownOptions extends DropdownTrigger {
    constructor() {
      super();
      this.render({});
    }
  
    render(props) {
      this.shadowRoot.innerHTML = `
        <style>${this.css()}</style>
        ${this.template(props)}
      `;
    }
  
    template() {
      return `
        <ul>
          <slot></slot>
        </ul>
      `;
    }
  
    css() {
      return `
        :host {
          width: 100%;
          display: none;
        }
  
        :host > ul {
          width: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid hsl(var(--border));
          padding: 0;
          border-radius: var(--radius);
          box-sizing: border-box;
          margin: 0;
          list-style: none;
          background: hsl(var(--background-secondary));
          overflow: hidden;
          max-height: 300px;
          overflow-y: auto;
        }
      `;
    }
  }
  customElements.define('x-dropdown-options', DropdownOptions);
  ///////
  
  class DropdownPlaceholder extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.render({});
    }
  
    render(props) {
      this.shadowRoot.innerHTML = `
        <style>${this.css()}</style>
        ${this.template(props)}
      `;
    }
  
    template() {
      return `
        <div><slot></slot></div>
      `;
    }
  
    css() {
      return `
        div {
          padding: 1rem;
          background: hsl(var(--background-secondary));
        }
      `;
    }
  
    preparePlaceholderNode({ refData, component, isMulti }) {
      // Implement the logic for preparing the placeholder node here
      // This is a placeholder implementation and should be replaced with actual logic
      const node = document.createElement('div');
      node.innerHTML = component;
      return node.outerHTML;
    }
  
    removeSelected(placeholder, el) {
      // Implement logic to remove selected items if needed
    }
  }
  
  customElements.define("x-dropdown-placeholder", DropdownPlaceholder);
  class DropdownPlaceholder extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.render({});
    }
  
    render(props) {
      this.shadowRoot.innerHTML = `
        <style>${this.css()}</style>
        ${this.template(props)}
      `;
    }
  
    template() {
      return `
        <div><slot></slot></div>
      `;
    }
  
    css() {
      return `
        div {
          padding: 1rem;
          background: hsl(var(--background-secondary));
        }
      `;
    }
  
    preparePlaceholderNode({ refData, component, isMulti }) {
      // Implement the logic for preparing the placeholder node here
      // This is a placeholder implementation and should be replaced with actual logic
      const node = document.createElement('div');
      node.innerHTML = component;
      return node.outerHTML;
    }
  
    removeSelected(placeholder, el) {
      // Implement logic to remove selected items if needed
    }
  }
  
  customElements.define('x-dropdown-option', DropdownOption);
  
  
  
  
  
  ///////
  
  class DropdownSearch extends DropdownTrigger {
    constructor() {
      super();
      this.render({});
  
      this.shadowRoot.querySelector("input")?.addEventListener("keyup", (e) => {
        const value = e.target.value;
        this.parentElement.querySelectorAll("x-dropdown-option").forEach(el => {
          const prevStyles = el.getAttribute("style");
          el.setAttribute("style", el.innerHTML?.includes(value) ? `
            ${prevStyles}
            display: flex;
          ` : `
            ${prevStyles}
            display: none;
          `);
        })
      })
    }
  
    render(props) {
      this.shadowRoot.innerHTML = `
        <style>${this.css()}</style>
        ${this.template(props)}
      `;
    }
  
    template() {
      return `
        <li>
          <input placeholder="Search..." />
        </li>
      `;
    }
  
    css() {
      return `
        :host {
          width: 100%;
          position: sticky;
          top: 0;
          left: 0;
          background: hsl(var(--background));
          z-index: 99;
        }
  
        :host > li {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
  
        :host > li > input {
          padding: .8rem 1rem;
          font-size: .9rem;
          font-weight: 500;
          color: hsl(var(--foreground));
          transition: all .4s ease-in-out;
          box-sizing: border-box;
          cursor: text;
          border: none;
          outline: none;
        }
  
        :host > li > input::placeholder {
          font-size: .9rem;
          color: hsl(var(--foreground), .5);
        }
      `;
    }
  }
  customElements.define('x-dropdown-search', DropdownSearch);
  
  
  
  class DropdownDivider extends DropdownTrigger {
    constructor() {
      super();
      this.render({});
    }
  
    render(props) {
      this.shadowRoot.innerHTML = `
        <style>${this.css()}</style>
        ${this.template(props)}
      `;
    }
  
    template() {
      return `
        <li></li>
      `;
    }
  
    css() {
      return `
        :host {
          width: 100%;
          border-bottom: 1px solid hsl(var(--border));
        }
      `;
    }
  }
  
  
  
  
  
  customElements.define('x-dropdown-divider', DropdownDivider);
  
  
  
  
  class DropdownItem extends DropdownTrigger {
    constructor() {
      super();
      this.render({});
  
      this.shadowRoot.querySelector("li")?.addEventListener("click", (e) => {
        this.closeDropdown()
      });
    }
  
    render(props) {
      this.shadowRoot.innerHTML = `
        <style>${this.css()}</style>
        ${this.template(props)}
      `;
    }
  
    template() {
      return `
        <li><slot></slot></li>
      `;
    }
  
    css() {
      return `
        :host {
          width: 100%;
          --ring-border: transparent;
          --ring-background: transparent;
        }
  
        :host > li {
          width: 100%;
          display: flex;
          flex-direction: column;
          padding: .8rem 1rem;
          font-size: 1rem;
          font-weight: 500;
          color: hsl(var(--foreground));
          transition: all .4s ease-in-out;
          box-sizing: border-box;
          cursor: pointer;
          position: relative;
        }
  
        :host > li::before {
          content: "";
          position: absolute;
          top: 5px;
          right: 5px;
          background: var(--ring-background);
          border: 1px solid var(--ring-border);
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }
  
        :host > li:hover {
          background: hsl(var(--background));
        }
      `;
    }
  }///
  
  
  customElements.define('x-dropdown-item', DropdownItem);
  
  class DropdownShowable extends DropdownTrigger {
    constructor() {
      super();
      this.render({});
    }
  
    render(props) {
      this.shadowRoot.innerHTML = `
        <style>${this.css()}</style>
        ${this.template(props)}
      `;
    }
  
    template() {
      return `
        <li><slot></slot></li>
      `;
    }
  
    css() {
      return `
        :host {
          width: 100%;
        }
      `;
    }
  }
  
  
  
  customElements.define('x-dropdown-showable', DropdownShowable);
  
  
 