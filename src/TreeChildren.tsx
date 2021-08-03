import { css, cx } from "@emotion/css";
import * as React from "react";
import { TreeNode, TreeNodePassedProps } from "./TreeNode";
import { treeviewCTX } from "./TreeView";

export const dragOverStyle = css({
  border: "solid 2px blue",
  margin: "-2px"
});

const dragDownStyle = css({
  borderBottom: "solid 2px blue",
  marginBottom: "-2px"
});

export type DragOverType = "UP" | "IN" | "DOWN" | "EMPTY" | undefined;

interface TreeChildrenProps<T = unknown> {
  id: string;
  data: T | null;
  dragOverState: DragOverType;
  setDragOverState: (state: DragOverType) => void;
  path: number[];
}

export function TreeChildren<T = unknown>({
  id,
  data = null,
  dragOverState,
  setDragOverState,
  path,
  children
}: React.PropsWithChildren<TreeChildrenProps<T>>) {
  const {
    marginWidth,
    dropZoneSplittingSize,
    openNodes,
    onMove
  } = React.useContext(treeviewCTX);

  const childrenLength = React.Children.count(children);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginLeft: marginWidth,
        backgroundColor: "rgba(100,100,100,0.1)"
      }}
      className={cx({
        [dragDownStyle]: dragOverState === "DOWN"
      })}
      onDragOver={(e) => {
        const div = e.currentTarget as HTMLDivElement;
        const { top, left, height } = div.getBoundingClientRect();
        const relativeY = e.clientY - top;
        const relativeX = e.clientX - left;
        if (
          childrenLength > 0 &&
          relativeX > marginWidth &&
          relativeX < marginWidth * 2 &&
          height - relativeY < dropZoneSplittingSize
        ) {
          e.preventDefault();
          setDragOverState("DOWN");
        } else {
          setDragOverState(undefined);
        }
      }}
      onDragLeave={() => {
        setDragOverState(undefined);
      }}
      onDrop={(e) => {
        const fromPath = JSON.parse(e.dataTransfer.getData("path"));
        const fromId = e.dataTransfer.getData("id");
        const fromData = JSON.parse(e.dataTransfer.getData("data"));
        let toPath =
          dragOverState === "DOWN" ? [...path, childrenLength] : undefined;

        if (toPath != null && onMove) {
          onMove(
            { path: fromPath, id: fromId, data: fromData },
            { path: toPath, id, data }
          );
        }

        setDragOverState(undefined);
      }}
    >
      {children != null && childrenLength === 0 ? (
        <div
          style={{ display: "flex", flexDirection: "row" }}
          className={cx({
            [dragOverStyle]: dragOverState === "EMPTY"
          })}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverState("EMPTY");
          }}
          onDragLeave={() => {
            setDragOverState(undefined);
          }}
          onDrop={(e) => {
            const fromPath = JSON.parse(e.dataTransfer.getData("path"));
            const fromId = e.dataTransfer.getData("id");
            const fromData = JSON.parse(e.dataTransfer.getData("data"));
            let toPath = dragOverState === "EMPTY" ? [...path, 0] : undefined;

            if (toPath != null && onMove) {
              onMove(
                { path: fromPath, id: fromId, data: fromData },
                { path: toPath, id, data }
              );
            }

            setDragOverState(undefined);
          }}
        >
          Empty...
        </div>
      ) : (
        React.Children.map(children, (child, index) => {
          if (
            !React.isValidElement(child) ||
            typeof child.type !== "function" ||
            child.type !== TreeNode
          ) {
            throw Error(
              "Only TreeNode component is allowed in TreeView or TreeNode"
            );
          }

          const newPath = [...path, index];
          const passedProps: TreeNodePassedProps<T> = {
            path: newPath,
            parentData: data,
            parentId: id
          };
          return React.cloneElement(child, {
            passedProps
          });
        })
      )}
    </div>
  );
}
