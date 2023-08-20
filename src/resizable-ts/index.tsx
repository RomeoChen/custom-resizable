import React, {
  useRef,
  useState,
  useEffect,
  ReactNode,
  ReactElement
} from "react";
import { DraggableCore } from "react-draggable";
import "./style.css";
import type {
  ResizeHandleAxis,
  DragCallbackData,
  ResizableProps
} from "./interface";
import { ReactRef } from "../resizable/propTypes";

function Resizable(props: ResizableProps) {
  const {
    children,
    className,
    draggableOpts,
    width,
    height,
    handle,
    lockAspectRatio = false,
    axis = "both",
    minConstraints = [20, 20],
    maxConstraints = [Infinity, Infinity],
    onResize,
    onResizeStop,
    onResizeStart,
    resizeHandles = ["se"],
    transformScale = 1,
    ...restProps
  } = props;

  const handleRefs = useRef<object>();
  const lastHandleRect = useRef(null);

  const [slack, setSlack] = useState(null);

  const resetData = () => {
    lastHandleRect.current = null;
    setSlack(null);
  };

  const runConstraints = (w: number, h: number) => {
    // short circuit
    if (!minConstraints && !maxConstraints && !lockAspectRatio) return [w, h];

    // If constraining to min and max, we need to also fit width and height to aspect ratio.
    if (lockAspectRatio) {
      const ratio = props.width / props.height;
      const deltaW = w - props.width;
      const deltaH = h - props.height;

      // Find which coordinate was greater and should push the other toward it.
      // E.g.:
      // ratio = 1, deltaW = 10, deltaH = 5, deltaH should become 10.
      // ratio = 2, deltaW = 10, deltaH = 6, deltaW should become 12.
      if (Math.abs(deltaW) > Math.abs(deltaH * ratio)) {
        h = w / ratio;
      } else {
        w = h * ratio;
      }
    }
    const [oldW, oldH] = [w, h];

    let [slackW, slackH] = slack || [0, 0];
    w += slackW;
    h += slackH;

    if (minConstraints) {
      w = Math.max(minConstraints[0], w);
      h = Math.max(minConstraints[1], h);
    }
    if (maxConstraints) {
      w = Math.min(maxConstraints[0], w);
      h = Math.min(maxConstraints[1], h);
    }

    setSlack([slackW + (oldW - w), slackH + (oldH - h)]);

    return [w, h];
  };

  const resizeHandler = (
    handlerName: "onResize" | "onResizeStart" | "onResizeStop",
    resizeAxis: ResizeHandleAxis
  ) => {
    return (e: any, { node, deltaX, deltaY }: DragCallbackData) => {
      if (handlerName === "onResizeStart") resetData();

      const canDragX =
        (axis === "both" || axis === "x") &&
        resizeAxis !== "n" &&
        resizeAxis !== "s";
      const canDragY =
        (axis === "both" || axis === "y") &&
        resizeAxis !== "e" &&
        resizeAxis !== "w";

      if (!canDragX && !canDragY) return;

      const axisV = resizeAxis[0];
      const axisH = resizeAxis[resizeAxis.length - 1];

      const handleRect = node.getBoundingClientRect();
      if (lastHandleRect.current != null) {
        if (axisH === "w") {
          const deltaLeftSinceLast =
            handleRect.left - lastHandleRect.current.left;
          deltaX += deltaLeftSinceLast;
        }
        if (axisV === "n") {
          const deltaTopSinceLast = handleRect.top - lastHandleRect.current.top;
          deltaY += deltaTopSinceLast;
        }
      }
      lastHandleRect.current = handleRect;

      if (axisH === "w") deltaX = -deltaX;
      if (axisV === "n") deltaY = -deltaY;

      let width = props.width + (canDragX ? deltaX / transformScale : 0);
      let height =
        props.height + (canDragY ? deltaY / props.transformScale : 0);

      [width, height] = runConstraints(width, height);

      const dimensionsChanged =
        width !== props.width || height !== props.height;

      const cb =
        typeof props[handlerName] === "function" ? props[handlerName] : null;
      const shouldSkipCb = handlerName === "onResize" && !dimensionsChanged;
      if (cb && !shouldSkipCb) {
        e.persist?.();
        cb(e, { node, size: { width, height }, handle: resizeAxis });
      }

      if (handlerName === "onResizeStop") resetData();
    };
  };

  const renderResizeHandle = (
    handleAxis: ResizeHandleAxis,
    ref: ReactRef
  ): ReactNode => {
    const { handle } = props;
    if (!handle) {
      return (
        <span
          className={`react-resizable-handle react-resizable-handle-${handleAxis}`}
          ref={ref}
        />
      );
    }
    if (typeof handle === "function") {
      return handle(handleAxis, ref);
    }
    // Handle is a React component (composite or DOM).
    const isDOMElement = typeof handle.type === "string";
    return React.cloneElement(handle as ReactElement, {
      ref,
      // Add `handleAxis` prop iff this is not a DOM element,
      // otherwise we'll get an unknown property warning
      ...(isDOMElement ? {} : { handleAxis })
    });
  };

  useEffect(() => {
    return () => {
      resetData();
    };
  }, []);

  return React.cloneElement(children as ReactElement, {
    ...restProps,
    className: `${className ? `${className} ` : ""}react-resizable`,
    children: [
      ...(children as ReactElement).props.children,
      ...resizeHandles?.map((handleAxis) => {
        const ref = handleRefs.current?.[handleAxis] ?? React.createRef();
        if (!handleRefs.current) {
          handleRefs.current = {
            [handleAxis]: ref
          };
        }
        handleRefs.current[handleAxis] = ref;
        return (
          <DraggableCore
            {...draggableOpts}
            nodeRef={ref}
            key={`resizableHandle-${handleAxis}`}
            onStop={resizeHandler("onResizeStop", handleAxis)}
            onStart={resizeHandler("onResizeStart", handleAxis)}
            onDrag={resizeHandler("onResize", handleAxis)}
          >
            {renderResizeHandle(handleAxis, ref)}
          </DraggableCore>
        );
      })
    ]
  });
}

export default Resizable;
