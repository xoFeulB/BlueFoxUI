window.customElements.define("anim-text", class extends HTMLElement {
  async sleep(msec) {
    return new Promise((resolve) => setTimeout(resolve, msec));
  };

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

  shuffle(array) {
    const cloneArray = [...array];

    const result = cloneArray.reduce((_, cur, idx) => {
      let rand = Math.floor(Math.random() * (idx + 1));
      cloneArray[idx] = cloneArray[rand]
      cloneArray[rand] = cur;
      return cloneArray
    })

    return result;
  }

  async show() {
    await this.animating;
    this.animating = new Promise(async (resolve) => {
      for (let index = 0; index < this.buffer.length; index++) {
        this.textContent = this.buffer[index];
        await this.sleep(this.sleepTime);
      }
      resolve();
    });
    return await this.animating;
  }
  async hide() {
    await this.animating;
    this.animating = new Promise(async (resolve) => {
      for (let index = 0; index < this.buffer.reversed.length; index++) {
        this.textContent = this.buffer.reversed[index];
        await this.sleep(this.sleepTime);
      }
      resolve();
    });
    return await this.animating;
  }
  set index(index) {
    if (this.buffer.length <= index) {
      index = this.buffer.length - 1;
    }
    this.textContent = this.buffer[index];
  }
  get index() {
    return this.buffer.indexOf(this.textContent);
  }

  async connectedCallback() {
    this.animating = new Promise(async (resolve) => {

      this.originalText = this.textContent;
      this.mask = this.attributes.mask ? this.attributes.mask.value : "";
      this.duration = Number(this.attributes.duration ? this.attributes.duration.value : 0);

      let charcterSet = this.shuffle(Array.from(
        new Set(this.originalText.split(""))
      ));
      charcterSet.originalLength = charcterSet.length;

      this.buffer = [];
      for (let count = 0; count <= charcterSet.originalLength; count++) {
        let tmpText = this.originalText;
        charcterSet.forEach((char) => {
          tmpText = tmpText.replaceAll(char, this.mask);
        });
        this.buffer.push(tmpText);
        charcterSet.shift();
      }
      this.buffer.reversed = this.buffer.toReversed();
      this.sleepTime = this.duration / (this.buffer.length - 1);

      if (this.attributes.hide) {
        this.textContent = this.buffer[0];
      }

      if (this.attributes.auto) {
        await this.show();
      }
      if (this.attributes.target) {
        this.target = {};
        this.target.separator = this.attributes.separator ? this.attributes.separator.value : ".";
        this.target.path = this.attributes.target.value.split(this.target.separator);
        this.target.element = (() => {
          if (this.target.path[0] == "this") {
            return this;
          }
          if (this.target.path[0] == "window") {
            return window;
          }
          return document.querySelector(this.target.path[0]);
        })();
        this.target.property = this.target.path.slice(1).join(this.target.separator);
        this.target.object = this.getProperty(
          this.target.property,
          this.target.element,
          this.target.separator
        );
        this.target.events = JSON.parse(
          this.attributes.events
            ? this.attributes.events.value
            : '["sync"]'
        );
        this.regex = new RegExp(this.attributes.regex?.value);

        if (!this.target.element.showWhenElements) {
          this.target.element.showWhenElements = [];
        }
        this.target.element.showWhenElements.push(this);

        let eventHandler = async () => {
          if (this.regex.test(this.target.object.object[this.target.object.property])) {
            if (this.index == 0) {
              await this.show();
            } else if (this.index != this.buffer.length - 1) {
              await this.show();
            }
          } else {
            if (this.index == this.buffer.length - 1) {
              await this.hide();
            } else if (this.index != 0) {
              await this.hide();
            }
          }
          this.dispatchEvent(new Event("sync"));
        };
        this.target.events.forEach((eventType) => {
          this.target.element.addEventListener(eventType, eventHandler);
        });
        await eventHandler();
        if (this.regex.test(this.target.object.object[this.target.object.property])) {
          this.index = this.buffer.length - 1;
        } else {
          this.index = 0;
        }
      }
      resolve();
    });

  }
});