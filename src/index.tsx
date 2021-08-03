import { render } from "react-dom";

import Test from "./Test";

const rootElement = document.getElementById("root");
render(<Test />, rootElement);

export { TreeView } from "./TreeView";
export { TreeNode } from "./TreeNode";
export * from "./helpers";
