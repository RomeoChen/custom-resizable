export type Axis = "both" | "x" | "y" | "none";
export type ResizeHandleAxis =
  | "s"
  | "w"
  | "e"
  | "n"
  | "sw"
  | "nw"
  | "se"
  | "ne";

export type DragCallbackData = {
  node: HTMLElement;
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  lastX: number;
  lastY: number;
};
export type ResizeCallbackData = {
  node: HTMLElement;
  size: { width: number; height: number };
  handle: ResizeHandleAxis;
};

type DraggableOpts = {
  allowAnyClick?: boolean;
  cancel?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  enableUserSelectHack?: boolean;
  offsetParent?: HTMLElement;
  grid?: [number, number];
  handle?: string;
  nodeRef?: React.RefObject<HTMLElement>;
  onStart?: () => void;
  onDrag?: () => void;
  onStop?: () => void;
  onMouseDown?: () => void;
  scale?: number;
};

export type ResizableProps = {
  axis?: Axis;
  className?: string;
  children: React.ReactNode;
  draggableOpts?: DraggableOpts;
  height?: number;
  handle?: React.ReactElement | ((...args: any[]) => React.ReactElement);
  handleSize?: number[];
  lockAspectRatio?: boolean;
  maxConstraints?: number[];
  minConstraints?: number[];
  onResizeStop?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
  onResizeStart?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
  onResize?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
  resizeHandles?: Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">;
  transformScale?: number;
  width?: number;
};
