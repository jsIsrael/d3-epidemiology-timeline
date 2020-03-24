export function loadNeededCss() {
  const manifest = require("./asset-manifest.json");
  console.log(manifest.files["main.css"]);
}

export * from "./library";
