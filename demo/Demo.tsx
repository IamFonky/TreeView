import "./style.css";
import reduce from "immer";
import * as React from "react";
import { TreeView } from "../src/TreeView";
import {
  getNode,
  LabelWithIcon,
  removeNode,
  setNode,
  structureToJSX,
} from "../src/helpers";
import { TreeNodeStructure } from "../src/types";

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
                  label: (
                    <LabelWithIcon
                      label="T1211 + This is a very very very very verrrrry long label"
                      icon={
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 141 110"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M109.307 16.0654C107.628 6.93147 99.6768 0 90.0835 0C80.4803 0 72.527 6.94621 70.8576 16.0924C31.0276 19.8786 
                      -0.122036 53.5563 0.000359452 94.5263C0.0272865 103.1 7.11888 110 15.667 110H90.0835C92.2474 110 94.0001 108.242 94.0001 
                      106.071C94.0001 101.733 90.4923 98.2143 86.1668 98.2143H66.7084L75.4719 86.3475C81.3811 77.4518 78.0055 64.6717 67.22 60.1734C61.3719 
                      57.7353 54.601 59.0317 49.5363 62.8449L41.5169 68.8826C39.7887 70.1864 37.3334 69.8426 36.0312 68.0993C34.7338 66.3609 35.0814 63.8982 
                      36.812 62.5969L45.3259 56.1908C54.344 49.3993 66.936 49.4092 75.9566 56.1908C78.6175 58.192 87.1851 65.7815 85.944 79.0772L114.959 110H137.083C139.247 
                      110 141 108.242 141 106.071C141 101.733 137.492 98.2143 133.167 98.2143H120.039L95.9217 72.5116L133.727 51.2359C135.933 49.9949 137.77 48.1867 139.048 
                      45.9975C140.326 43.8083 141 41.317 141 38.7799C141 33.5254 138.131 28.7252 133.539 26.2011C123.61 20.7453 109.307 16.0654 109.307 16.0654ZM90.0835 25.5357C86.8375 
                      25.5357 84.2085 22.8962 84.2085 19.6429C84.2085 16.3871 86.8375 13.75 90.0835 13.75C93.3269 13.75 95.9585 16.3871 95.9585 19.6429C95.9585 22.8962 93.3269 25.5357 
                      90.0835 25.5357Z"
                            fill="#000"
                          />
                        </svg>
                      }
                    />
                  ),
                  items: [{ id: "T12111", label: "T12111" }],
                },
              ],
            },
          ],
        },
        { id: "T13", label: "T13" },
      ],
    },
    {
      id: "T2",
      label: "T2",
      items: [
        { id: "T21", label: "T21" },
        { id: "T22", label: "T22", items: [] },
      ],
    },
    { id: "T3", label: "T3" },
    { id: "T4", label: "T4" },
    {
      id: "T5",
      label:
        "T5 akdksd  kdjsbd jabdnf dnfknsdfnjkdsnfk dnfnd fndnf jdnn sfi fnmen je cejncke nckej fl,m, yse",
      items: [
        {
          id: "T51",
          label: "T51",
          items: [
            { id: "T511", label: "T511" },
            { id: "T512", label: "T512", items: [] },
          ],
        },
      ],
    },
  ],
};

export const testOpenNodes = { T1: true, T12: true, T121: true, T1211: true };

export default function Demo() {
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
            onOpenNode: setOpenNodes,
          }}
          parameters={{ openOnDrag: 500 }}
        >
          {structure.items!.map((item) => structureToJSX(item))}
        </TreeView>
        <div>{JSON.stringify(openNodes)}</div>
      </div>
    </div>
  );
}
