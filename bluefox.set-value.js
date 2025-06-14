window.customElements.define("set-value", class extends HTMLElement {
  getProperty(_path, _obj, _sep = ".") {
    let _key = _path.split(_sep)[0];
    let _next_path = _path.split(_sep).slice(1).join(_sep);
    if (_obj[_key] != undefined) {
      let R = this.getProperty(_next_path, _obj[_key], _sep);
      if (R === true) {
        return {
          object: _obj,
          property: _key,
          path: _path,
          separator: _sep,
          value: _obj[_key],
        };
      } else {
        return R;
      }
    } else {
      if (_path == _next_path) {
        return true;
      } else {
        return false;
      }
    }
  };
  connectedCallback() {
    let target = {};
    target.separator = this.attributes.separator ? this.attributes.separator.value : ".";
    target.path = this.attributes.target.value.split(target.separator);
    target.element = (() => {
      if (target.path[0] == "this") {
        return this;
      }
      if (target.path[0] == "window") {
        return window;
      }
      return document.querySelector(target.path[0]);
    })();
    target.property = target.path.slice(1).join(target.separator);
    target.object = this.getProperty(
      target.property,
      target.element,
      target.separator
    );
    target.events = this.attributes.events ? JSON.parse(this.attributes.events.value) : ["sync"];

    target.events.forEach((eventType) => {
      this.addEventListener(eventType, async (event) => {
        if (target.object.object[target.object.property] != this.attributes.value.value) {
          try {
            target.object.object[target.object.property] = this.attributes.value.value;
            target.element.dispatchEvent(new Event("sync"));
          } catch (e) { }
        }
      });
    });
  }
});