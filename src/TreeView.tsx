import * as React from "react";
import { DragOverType, TreeChildren } from "./TreeChildren";

export const TREEVIEW_DND_TYPE = "TREEVIEW_DND_TYPE";

const MARGIN_SIZE = 20;
const MINIMUM_NODE_LABEL_HEIGHT = 30;
const MINIMUM_NODE_LABEL_WIDTH = 100;
const KEEP_OPEN_ON_DRAG = false;
const OPEN_CLOSE_BUTTONS = {
  open: "v",
  close: ">"
};

interface TreeViewContextParameters {
  marginWidth: number;
  minimumLabelHeight: number;
  minimumLabelWidth: number;
  keepOpenOnDrag: boolean;
  openCloseButtons: {
    open: React.ReactNode;
    close: React.ReactNode;
  };
}

type OnMoveFn<T = unknown> = (
  from: { path: number[]; id: string; data?: T | null },
  to: { path: number[]; id: string; data?: T | null }
) => void;

type TreeContextParameters = Partial<TreeViewContextParameters>;

interface TreeViewContext<T = unknown> extends TreeViewContextParameters {
  dropZoneSplittingSize: number;
  openNodes: { [path: string]: boolean | undefined };
  toggleNode: (id: string) => void;
  onMove?: OnMoveFn<T>;
}

export const treeviewCTX = React.createContext<TreeViewContext>({
  marginWidth: MARGIN_SIZE,
  minimumLabelHeight: MINIMUM_NODE_LABEL_HEIGHT,
  minimumLabelWidth: MINIMUM_NODE_LABEL_WIDTH,
  dropZoneSplittingSize: MINIMUM_NODE_LABEL_HEIGHT / 3,
  keepOpenOnDrag: KEEP_OPEN_ON_DRAG,
  openCloseButtons: OPEN_CLOSE_BUTTONS,
  openNodes: {},
  toggleNode: () => {},
  onMove: () => {}
});

interface TreeViewProps<T = unknown> {
  rootId: string;
  rootData?: T | null;
  nodeManagement?: {
    openNodes: { [path: string]: boolean | undefined };
    onOpenNode: (nodes: { [path: string]: boolean | undefined }) => void;
  };
  onMove?: OnMoveFn;
  parameters?: TreeContextParameters;
}

export function TreeView<T = unknown>({
  rootId,
  rootData = null,
  nodeManagement,
  parameters,
  onMove,
  children
}: React.PropsWithChildren<TreeViewProps<T>>) {
  const {
    marginWidth = MARGIN_SIZE,
    minimumLabelHeight = MINIMUM_NODE_LABEL_HEIGHT,
    minimumLabelWidth = MINIMUM_NODE_LABEL_WIDTH,
    keepOpenOnDrag = KEEP_OPEN_ON_DRAG,
    openCloseButtons = OPEN_CLOSE_BUTTONS
  } = parameters || {};

  const { openNodes, onOpenNode } = nodeManagement || {};

  const [openNodesState, setOpenNodes] = React.useState<{
    [path: string]: boolean | undefined;
  }>(openNodes || {});
  const [dragOverState, setDragOverState] = React.useState<DragOverType>();

  const dropZoneSplittingSize = minimumLabelHeight / 3;

  return (
    <treeviewCTX.Provider
      value={{
        marginWidth,
        minimumLabelHeight,
        minimumLabelWidth,
        dropZoneSplittingSize,
        keepOpenOnDrag,
        openCloseButtons,
        openNodes: openNodes || openNodesState,
        toggleNode: (id: string) => {
          if (openNodes != null && onOpenNode != null) {
            onOpenNode({ ...openNodes, [id]: !openNodes[id] });
          } else {
            setOpenNodes((o) => ({ ...o, [id]: !o[id] }));
          }
        },
        onMove: onMove != null ? onMove : () => {}
      }}
    >
      <TreeChildren
        id={rootId}
        data={rootData}
        dragOverState={dragOverState}
        setDragOverState={setDragOverState}
        path={[]}
      >
        {children}
      </TreeChildren>
    </treeviewCTX.Provider>
  );
}
