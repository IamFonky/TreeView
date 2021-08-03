import { CSSProperties, ReactNode } from "react";

export interface StyleClassId {
  style?: CSSProperties;
  className?: string;
  id?: string;
}

export type TreeNodeStructure = {
  id: string;
  label: ReactNode;
  items?: TreeNodeStructure[];
};
