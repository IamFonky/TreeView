import "./styles.css";
import reduce from "immer";
import * as React from "react";
import { TreeView } from "./TreeView";
import {
  getNode,
  removeNode,
  setNode,
  structureToJSX,
  TreeNodeStructure
} from "./helpers";

export const defaultStructure: TreeNodeStructure = {
  id: "Root",
  label: "Root",
  items: [
    {
      id: "T1",
      label: "T1",
      items: [
        { id: "T11", label: "T11" },
        {
          id: "T12",
          label: "T12",
          items: [
            {
              id: "T121",
              label: "T121",
              items: [
                {
                  id: "T1211",
                  label: "T1211",
                  items: [{ id: "T12111", label: "T12111" }]
                }
              ]
            }
          ]
        },
        { id: "T13", label: "T13" }
      ]
    },
    {
      id: "T2",
      label: "T2",
      items: [
        { id: "T21", label: "T21" },
        { id: "T22", label: "T22", items: [] }
      ]
    },
    { id: "T3", label: "T3" },
    { id: "T4", label: "T4" },
    {
      id: "T5",
      label: "T5",
      items: [
        {
          id: "T51",
          label: "T51",
          items: [
            { id: "T511", label: "T511" },
            { id: "T512", label: "T512", items: [] }
          ]
        }
      ]
    }
  ]
};

export const testOpenNodes = { T1: true, T12: true, T121: true, T1211: true };

export default function Test() {
  const [structure, setStructure] = React.useState(defaultStructure);
  const [openNodes, setOpenNodes] = React.useState<{
    [path: string]: boolean | undefined;
  }>({});

  function onMove<T = unknown>(
    from: { path: number[]; id: string; data?: T | null },
    to: { path: number[]; id: string; data?: T | null }
  ) {
    setStructure(
      reduce((state) => {
        const toMove = getNode(state, from.path);
        setNode(state, to.path, toMove);
        removeNode(state, from.path, to.path);
        return state;
      })
    );
  }

  return (
    <div className="App">
      <h1>Treeview</h1>
      <div>
        <button
          onClick={() => {
            setOpenNodes((ons) =>
              JSON.stringify(ons) === JSON.stringify(testOpenNodes)
                ? {}
                : testOpenNodes
            );
          }}
        >
          Toggle T1 tree
        </button>
        <TreeView
          rootId="TreeView"
          onMove={onMove}
          nodeManagement={{
            openNodes,
            onOpenNode: setOpenNodes
          }}
        >
          {structure.items!.map((item) => structureToJSX(item))}
        </TreeView>
        <div>{JSON.stringify(openNodes)}</div>
      </div>
    </div>
  );
}
