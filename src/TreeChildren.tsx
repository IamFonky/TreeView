import { css, cx } from "@emotion/css";
import * as React from "react";
import { TreeNode, TreeNodePassedProps } from "./TreeNode";
import { treeviewCTX } from "./TreeView";

const emptyStyle = css({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  cursor: "default",
  paddingLeft: "5px",
  textAlign: "left",
  color: "#bbb"
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
    minimumLabelHeight,
    dropZoneSplittingSize,
    designParams,
    onMove
  } = React.useContext(treeviewCTX);

  const childrenLength = React.Children.count(children);
  const dragDownStyle = css({
    borderBottom:
      "solid " +
      designParams.dragUpOrDownLineWidth +
      "px " +
      designParams.dragUpOrDownColor,
    marginBottom: "-" + designParams.dragUpOrDownLineWidth + "px"
  });
  const dragOverStyle = css({
    border:
      "solid " +
      designParams.dragOverBorderWidth +
      "px " +
      designParams.dragOverColor,
    margin: "-" + designParams.dragOverBorderWidth + "px"
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginLeft: marginWidth
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
          style={{ height: minimumLabelHeight }}
          className={cx(emptyStyle, {
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
