import { ReactElement } from "react";

export type DraggableCoreState = {
  dragging: boolean;
  lastX: number;
  lastY: number;
  touchIdentifier: number;
};

export type DraggableData = {
  node: HTMLElement;
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  lastX: number;
  lastY: number;
};

export type EventHandler<T> = (e: T) => void | false;

export type ControlPosition = { x: number; y: number };
export type PositionOffsetControlPosition = {
  x: number | string;
  y: number | string;
};

export type DraggableEventHandler = (
  e: MouseEvent,
  data: DraggableData
) => void | false;

export type DraggableCoreDefaultProps = {
  allowAnyClick: boolean;
  disabled: boolean;
  enableUserSelectHack: boolean;
  onStart: DraggableEventHandler;
  onDrag: DraggableEventHandler;
  onStop: DraggableEventHandler;
  onMouseDown: (e: MouseEvent) => void;
  scale: number;
};

export type DraggableCoreProps = DraggableCoreDefaultProps & {
  cancel: string;
  children: ReactElement<any>;
  offsetParent: HTMLElement;
  grid: [number, number];
  handle: string;
  nodeRef?: React.ElementRef<any>;
};
