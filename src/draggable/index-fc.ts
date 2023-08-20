import {
  useState,
  useRef,
  useMemo,
  useCallback,
  FC,
  useEffect,
  Ref,
  RefObject
} from "react";
import ReactDOM from "react-dom";
import {
  matchesSelectorAndParentsTo,
  addUserSelectStyles,
  getTouchIdentifier,
  removeUserSelectStyles
} from "./domFns";
import { createCoreData, getControlPosition, snapToGrid } from "./positionFns";
import { log } from "./utils";

import type { ReactElement } from "react";

import type {
  DraggableCoreState,
  DraggableData,
  EventHandler
} from "./interface";

// Simple abstraction for dragging events names.
const eventsFor = {
  touch: {
    start: "touchstart",
    move: "touchmove",
    stop: "touchend"
  },
  mouse: {
    start: "mousedown",
    move: "mousemove",
    stop: "mouseup"
  }
};

// Default to mouse events.
let dragEventFor = eventsFor.mouse;

export type DraggableEventHandler = (
  e: MouseEvent,
  data: DraggableData
) => void | false;

export type ControlPosition = { x: number; y: number };
export type PositionOffsetControlPosition = {
  x: number | string;
  y: number | string;
};

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
  nodeRef?: RefObject<HTMLElement>;
};

//
// Define <DraggableCore>.
//
// <DraggableCore> is for advanced usage of <Draggable>. It maintains minimal internal state so it can
// work well with libraries that require more control over the element.
//

const DraggableCore: FC<DraggableCoreProps> = (props) => {
  const [dragging, setDragging] = useState(false);
  const [lastX, setLastX] = useState(NaN);
  const [lastY, setLastY] = useState(NaN);
  const [touchIdentifier, setTouchIdentifier] = useState(null);

  const { nodeRef } = props;
  const mounted = useRef(false);

  const findDOMNode = () => {
    // Your findDOMNode implementation goes here
    return nodeRef.current;
  };

  const onTouchStart = () => {
    // Your onTouchStart implementation goes here
  };

  const handleDrag = (e) => {
    const position = getControlPosition(e, state.touchIdentifier, this);
    if (position == null) return;
    let { x, y } = position;

    if (Array.isArray(this.props.grid)) {
      let deltaX = x - lastX, deltaY = y - lastY;
      [deltaX, deltaY] = snapToGrid(this.props.grid, deltaX, deltaY);
      if (!deltaX && !deltaY) return;
      x = lastX + deltaX, y = lastY + deltaY;
    }

    const coreEvent = createCoreData(this, x, y);

    log('DraggableCore: handleDrag: %j', coreEvent);

    const shouldUpdate = this.props.onDrag(e, coreEvent);
    if (shouldUpdate === false) {
      try {
        handleDragStop(new MouseEvent('mouseup'));
      } catch (err) {
        const event = ((document.createEvent('MouseEvents'): any): MouseEvent);
        event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        handleDragStop(event);
      }
      return;
    }

    setLastX(x);
    setLastY(y);
  };

  const handleDragStop = () => {
    // Your handleDragStop implementation goes here
  };

  const removeUserSelectStyles = (ownerDocument) => {
    // Your removeUserSelectStyles implementation goes here
  };

  useEffect(() => {
    

    const thisNode = findDOMNode();
    if (thisNode) {
      const { ownerDocument } = thisNode;
      thisNode.addEventListener(eventsFor.touch.start, onTouchStart, {
        passive: false
      });

      return () => {
        mounted.current = false;
        ownerDocument.removeEventListener(eventsFor.mouse.move, handleDrag);
        ownerDocument.removeEventListener(eventsFor.touch.move, handleDrag);
        ownerDocument.removeEventListener(eventsFor.mouse.stop, handleDragStop);
        ownerDocument.removeEventListener(eventsFor.touch.stop, handleDragStop);
        thisNode.removeEventListener(
          eventsFor.touch.start,
          onTouchStart,
          false
        );
        if (enableUserSelectHack) removeUserSelectStyles(ownerDocument);
      };
    }
  }, []);
};

export default DraggableCore;
