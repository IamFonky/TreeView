import * as React from "react";
import { StyleClassId } from "./types";
import { css, cx } from "@emotion/css";
import { dragOverStyle, DragOverType, TreeChildren } from "./TreeChildren";
import { treeviewCTX } from "./TreeView";

const dragUpStyle = css({
  borderTop: "solid 2px blue",
  marginTop: "-2px"
});

export interface TreeNodePassedProps<T = unknown> {
  parentData?: T | null;
  parentId: string;
  path: number[];
}

interface TreeNodeProps<T = unknown> extends StyleClassId {
  id: string;
  passedProps?: TreeNodePassedProps<T>;
  data?: T | null;
  label: React.ReactNode;
}

export function TreeNode<T = unknown>({
  passedProps,
  data = null,
  label,
  children,
  style,
  className,
  id
}: React.PropsWithChildren<TreeNodeProps<T>>) {
  const [dragging, setDragging] = React.useState(false);
  const [dragOverState, setDragOverState] = React.useState<DragOverType>();

  const {
    marginWidth,
    dropZoneSplittingSize,
    minimumLabelHeight,
    keepOpenOnDrag,
    openCloseButtons,
    openNodes,
    toggleNode,
    onMove
  } = React.useContext(treeviewCTX);

  const { parentData = null, parentId, path = [] } = passedProps || {};
  const open = openNodes[id];

  return (
    <div
      onDragStart={(e) => {
        e.stopPropagation();
        setDragging(true);
      }}
      onDragEnd={(e) => {
        e.stopPropagation();
        setDragging(false);
      }}
      style={{ ...{ display: "flex", flexDirection: "column" }, ...style }}
      className={cx(className)}
      id={id}
    >
      <div
        draggable
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          minHeight: minimumLabelHeight
        }}
        className={cx({
          [dragOverStyle]: dragOverState === "IN" || dragOverState === "DOWN",
          [dragUpStyle]: dragOverState === "UP"
        })}
        onDragStart={(e) => {
          e.dataTransfer.setData("path", JSON.stringify(path));
          e.dataTransfer.setData("id", id);
          e.dataTransfer.setData("data", JSON.stringify(data));
        }}
        onDragOver={(e) => {
          const div = e.currentTarget as HTMLDivElement;
          const { top, height } = div.getBoundingClientRect();
          const relativeY = e.clientY - top;
          if (!dragging) {
            if (relativeY < dropZoneSplittingSize) {
              setDragOverState("UP");
              e.preventDefault();
            } else if (
              children != null &&
              height - relativeY > dropZoneSplittingSize
            ) {
              setDragOverState("IN");
              e.preventDefault();
            } else {
              setDragOverState(undefined);
            }
          }
        }}
        onDragLeave={() => {
          setDragOverState(undefined);
          return false;
        }}
        onDrop={(e) => {
          const fromPath = JSON.parse(e.dataTransfer.getData("path"));
          const fromId = e.dataTransfer.getData("id");
          const fromData = JSON.parse(e.dataTransfer.getData("data"));

          let toPath: number[] | undefined = undefined;
          let toData: T | null = null;
          let toId: string | undefined = undefined;

          if (dragOverState === "IN") {
            toPath = [...path, 0];
            toData = data;
            toId = id;
          } else if (dragOverState === "UP") {
            toPath = [...path.slice(0, -1), path.slice(-1)[0]];
            toData = parentData;
            toId = parentId;
          }

          if (toPath != null && toId != null && onMove) {
            onMove(
              { path: fromPath, id: fromId, data: fromData },
              { path: toPath, id: toId, data: toData }
            );
          }

          setDragOverState(undefined);
        }}
      >
        {children != null && (
          <div
            style={{ cursor: "pointer", width: marginWidth }}
            onClick={() => toggleNode(id)}
          >
            {open ? openCloseButtons.open : openCloseButtons.close}
          </div>
        )}
        {label}
      </div>
      {(!dragging || keepOpenOnDrag) && open && (
        <TreeChildren
          id={id}
          key={id}
          dragOverState={dragOverState}
          setDragOverState={setDragOverState}
          path={path}
          data={data}
        >
          {children}
        </TreeChildren>
      )}
    </div>
  );
}
