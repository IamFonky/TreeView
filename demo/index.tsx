import { render } from "react-dom";

import Demo from "./Demo";

const rootElement = document.getElementById("root");
render(<Demo />, rootElement);

export { TreeView } from "../src/TreeView";
export { TreeNode } from "../src/TreeNode";
export * from "../src/helpers";
