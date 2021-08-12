import * as React from "react";
import { StyleClassId } from "./types";
import { css, cx } from "@emotion/css";
import { dragOverStyle, DragOverType, TreeChildren } from "./TreeChildren";
import { treeviewCTX } from "./TreeView";

export const nodeStyle = css({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  cursor: "pointer",
  textAlign: "left",
  width: "100%",
  paddingLeft: "5px"
});

const folderStyle = css({
  fontWeight: "bold"
});

const selectedNodeStyle = css({
  backgroundColor: "#aaa"
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
  const oppeningTimer = React.useRef<number | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [dragOverState, setDragOverState] = React.useState<DragOverType>();

  const {
    marginWidth,
    dropZoneSplittingSize,
    minimumLabelHeight,
    keepOpenOnDrag,
    openCloseButtons,
    designParams,
    openNodes,
    toggleNode,
    onMove
  } = React.useContext(treeviewCTX);

  const { parentData = null, parentId, path = [] } = passedProps || {};
  const open = openNodes[id];

  const dragUpStyle = css({
    borderTop:
      "solid " +
      designParams.dragUpOrDownLineWidth +
      "px " +
      designParams.dragUpOrDownColor,
    marginTop: "-" + designParams.dragUpOrDownLineWidth + "px"
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
          minHeight: minimumLabelHeight
        }}
        className={cx(
          nodeStyle,
          css({
            "&:hover": {
              outline:
                "solid " +
                designParams.hoverBorderwidth +
                "px " +
                designParams.hoverBorderColor
            }
          }),
          {
            [dragOverStyle]: dragOverState === "IN" || dragOverState === "DOWN",
            [dragUpStyle]: dragOverState === "UP",
            [folderStyle]: children != null
          }
        )}
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
              if (oppeningTimer.current != null) {
                clearTimeout(oppeningTimer.current);
              }
              oppeningTimer.current = setTimeout(() => {
                if (dragOverState === "IN") {
                  if (!open) {
                    toggleNode(id);
                  }
                }
              }, 500);
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
            style={{ cursor: "pointer", width: marginWidth, textAlign: "left" }}
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
