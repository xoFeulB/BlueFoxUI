window.customElements.define("sync-view", class extends HTMLElement {
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
  }
  connectedCallback() {
    let syncer = {
      separator: this.attributes.separator ? this.attributes.separator.value : ".",
      from: this.attributes.from.value,
      to: this.attributes.to.value,
      events: this.attributes.events ? JSON.parse(this.attributes.events.value) : ["sync"],
      entryNop: !!this.attributes.entryNop,
      waitActivate: !!this.attributes.waitActivate,
      default: this.attributes.default ? this.attributes.default.value : "",
    };

    let init = (syncer) => {
      __init__(syncer);
    };
    let __init__ = (syncer) => {
      let separator = syncer.separator ? syncer.separator : ".";
      let from = syncer.from.split(separator);
      let to = syncer.to.split(separator);

      let from_element = (() => {
        if (from[0] == "this") {
          return this;
        }
        if (from[0] == "window") {
          return window;
        }
        return document.querySelector(from[0]);
      })();
      let to_element = (() => {
        if (to[0] == "this") {
          return this;
        }
        if (to[0] == "window") {
          return window;
        }
        return document.querySelector(to[0]);
      })();

      let SyncView = {
        separator: separator,
        from: from_element,
        fromProperty: from.slice(1).join(separator),
        to: to_element,
        toProperty: to.slice(1).join(separator),
        events: syncer.events,
        entryNop: syncer.entryNop,
        default: syncer.default,
        init: init,
      };

      SyncView.sync = () => {
        let fromObj = this.getProperty(
          SyncView.fromProperty,
          SyncView.from,
          SyncView.separator
        );
        let toObj = this.getProperty(
          SyncView.toProperty,
          SyncView.to,
          SyncView.separator
        );
        try {
          if (!!SyncView.default && !fromObj.object[fromObj.property]) {
            toObj.object[toObj.property] = SyncView.default;
          } else {
            toObj.object[toObj.property] = fromObj.object[fromObj.property];
          }
        } catch { }
      };

      SyncView.events.forEach((eventType) => {
        SyncView.from.addEventListener(eventType, (event) => {
          SyncView.sync();
          SyncView.to.dispatchEvent(new Event("sync"));
        });
      });
      SyncView.entryNop ? null : SyncView.sync();
      this.SyncView = SyncView;
    };

    if (syncer.waitActivate) {
      this.activate = () => {
        init(syncer);
      };
    } else {
      init(syncer);
    }
  }
});