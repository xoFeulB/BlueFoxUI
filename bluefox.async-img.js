window.customElements.define("async-img", class extends HTMLImageElement {
  constructor() {
    super();
    this.hasLoaded = new Promise((resolve, reject) => {
      this.addEventListener("load", (event) => {
        resolve(event);
      });
      this.addEventListener("error", (event) => {
        reject(event);
      });
    });
  }
}, { extends: "img" });
