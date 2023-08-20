import { isNum, int } from "./shims";
import {
  getTouch,
  innerWidth,
  innerHeight,
  offsetXYFromParent,
  outerWidth,
  outerHeight
} from "./domFns";

import type {
  Bounds,
  ControlPosition,
  DraggableData,
  MouseTouchEvent
} from "./types";
import type { DraggableCore } from "./interface";

export function snapToGrid(
  grid: [number, number],
  pendingX: number,
  pendingY: number
): [number, number] {
  const x = Math.round(pendingX / grid[0]) * grid[0];
  const y = Math.round(pendingY / grid[1]) * grid[1];
  return [x, y];
}

// Get {x, y} positions from event.
export function getControlPosition(
  e: MouseTouchEvent,
  touchIdentifier: number,
  draggableCore: DraggableCore
): ?ControlPosition {
  const touchObj =
    typeof touchIdentifier === "number" ? getTouch(e, touchIdentifier) : null;
  if (typeof touchIdentifier === "number" && !touchObj) return null; // not the right touch
  const node = findDOMNode(draggableCore);
  // User can provide an offsetParent if desired.
  const offsetParent =
    draggableCore.props.offsetParent ||
    node.offsetParent ||
    node.ownerDocument.body;
  return offsetXYFromParent(
    touchObj || e,
    offsetParent,
    draggableCore.props.scale
  );
}

// Create an data object exposed by <DraggableCore>'s events
export function createCoreData(
  draggable: DraggableCore,
  x: number,
  y: number
): DraggableData {
  const state = draggable.state;
  const isStart = !isNum(state.lastX);
  const node = findDOMNode(draggable);

  if (isStart) {
    // If this is our first move, use the x and y as last coords.
    return {
      node,
      deltaX: 0,
      deltaY: 0,
      lastX: x,
      lastY: y,
      x,
      y
    };
  } else {
    // Otherwise calculate proper values.
    return {
      node,
      deltaX: x - state.lastX,
      deltaY: y - state.lastY,
      lastX: state.lastX,
      lastY: state.lastY,
      x,
      y
    };
  }
}

// Create an data exposed by <Draggable>'s events
export function createDraggableData(
  draggable: Draggable,
  coreData: DraggableData
): DraggableData {
  const scale = draggable.props.scale;
  return {
    node: coreData.node,
    x: draggable.state.x + coreData.deltaX / scale,
    y: draggable.state.y + coreData.deltaY / scale,
    deltaX: coreData.deltaX / scale,
    deltaY: coreData.deltaY / scale,
    lastX: draggable.state.x,
    lastY: draggable.state.y
  };
}

// A lot faster than stringify/parse
function cloneBounds(bounds: Bounds): Bounds {
  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom
  };
}

function findDOMNode(draggable: Draggable | DraggableCore): HTMLElement {
  const node = draggable.findDOMNode();
  if (!node) {
    throw new Error("<DraggableCore>: Unmounted during event!");
  }
  // $FlowIgnore we can't assert on HTMLElement due to tests... FIXME
  return node;
}
