import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

const LONG_PRESS_MS = 400;
const CANCEL_MOVE_PX = 8;
const FALLBACK_ITEM_HEIGHT = 64;

export type PointerReorderDrag = {
  readonly fromIndex: number;
  readonly overIndex: number;
  readonly translateY: number;
  readonly itemHeight: number;
};

type ReorderBounds = {
  readonly minIndex: number;
  readonly maxIndex: number;
};

type PendingPress = {
  readonly index: number;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly bounds: ReorderBounds;
  readonly mode: "handle" | "long-press";
};

type ActiveDrag = {
  fromIndex: number;
  overIndex: number;
  pointerId: number;
  startY: number;
  itemHeight: number;
  minIndex: number;
  maxIndex: number;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const usePointerReorder = ({
  onReorder,
  onDragStart,
  onDragEnd,
}: {
  readonly onReorder: (fromIndex: number, toIndex: number) => void;
  readonly onDragStart?: () => void;
  readonly onDragEnd?: () => void;
}) => {
  const [drag, setDrag] = useState<PointerReorderDrag | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dragRef = useRef<ActiveDrag | null>(null);
  const pendingRef = useRef<PendingPress | null>(null);
  const timerRef = useRef(0);
  const listenersRef = useRef<{
    readonly move: (event: PointerEvent) => void;
    readonly up: (event: PointerEvent) => void;
  } | null>(null);
  const callbacksRef = useRef({ onReorder, onDragStart, onDragEnd });
  callbacksRef.current = { onReorder, onDragStart, onDragEnd };

  const measureHeight = (index: number): number => {
    const item = listRef.current?.children[index];
    if (!(item instanceof HTMLElement)) {
      return FALLBACK_ITEM_HEIGHT;
    }

    const height = item.getBoundingClientRect().height;
    return height > 0 ? height : FALLBACK_ITEM_HEIGHT;
  };

  const stopPending = () => {
    pendingRef.current = null;
    if (timerRef.current !== 0) {
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    }
  };

  const detachWindowListeners = () => {
    const listeners = listenersRef.current;
    if (!listeners) {
      return;
    }

    window.removeEventListener("pointermove", listeners.move);
    window.removeEventListener("pointerup", listeners.up);
    window.removeEventListener("pointercancel", listeners.up);
    listenersRef.current = null;
  };

  const endDrag = () => {
    const active = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    callbacksRef.current.onDragEnd?.();

    if (!active || active.fromIndex === active.overIndex) {
      return;
    }

    callbacksRef.current.onReorder(active.fromIndex, active.overIndex);
  };

  const updateFromY = (clientY: number) => {
    const active = dragRef.current;
    if (!active) {
      return;
    }

    const translateY = clientY - active.startY;
    const overIndex = clamp(
      active.fromIndex + Math.round(translateY / active.itemHeight),
      active.minIndex,
      active.maxIndex,
    );
    active.overIndex = overIndex;
    setDrag({
      fromIndex: active.fromIndex,
      overIndex,
      translateY,
      itemHeight: active.itemHeight,
    });
  };

  const startDrag = (pending: PendingPress, startY = pending.startY) => {
    stopPending();
    const itemHeight = measureHeight(pending.index);
    dragRef.current = {
      fromIndex: pending.index,
      overIndex: pending.index,
      pointerId: pending.pointerId,
      startY,
      itemHeight,
      minIndex: pending.bounds.minIndex,
      maxIndex: pending.bounds.maxIndex,
    };
    callbacksRef.current.onDragStart?.();
    setDrag({
      fromIndex: pending.index,
      overIndex: pending.index,
      translateY: 0,
      itemHeight,
    });
    navigator.vibrate?.(10);
  };

  const onItemPointerDown = (
    index: number,
    event: ReactPointerEvent<Element>,
    bounds: ReorderBounds,
    mode: "handle" | "long-press" = "long-press",
  ) => {
    if (event.button !== 0) {
      return;
    }

    if (dragRef.current) {
      return;
    }

    const existingPending = pendingRef.current;
    if (existingPending && existingPending.pointerId !== event.pointerId) {
      return;
    }

    stopPending();
    detachWindowListeners();

    const pending: PendingPress = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      bounds,
      mode,
    };
    pendingRef.current = pending;

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pending.pointerId) {
        return;
      }

      if (dragRef.current) {
        moveEvent.preventDefault();
        updateFromY(moveEvent.clientY);
        return;
      }

      const current = pendingRef.current;
      if (!current || current.pointerId !== moveEvent.pointerId) {
        return;
      }

      const movedFar =
        Math.abs(moveEvent.clientX - current.startX) > CANCEL_MOVE_PX ||
        Math.abs(moveEvent.clientY - current.startY) > CANCEL_MOVE_PX;

      if (!movedFar) {
        return;
      }

      if (current.mode === "handle") {
        startDrag(current, moveEvent.clientY);
        return;
      }

      stopPending();
      detachWindowListeners();
    };

    const onUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== pending.pointerId) {
        return;
      }

      detachWindowListeners();

      if (dragRef.current) {
        endDrag();
        return;
      }

      stopPending();
    };

    listenersRef.current = { move: onMove, up: onUp };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    if (mode === "handle") {
      startDrag(pending);
      return;
    }

    timerRef.current = window.setTimeout(() => {
      if (pendingRef.current === pending) {
        startDrag(pending);
      }
    }, LONG_PRESS_MS);
  };

  useEffect(() => {
    const timer = timerRef;
    const listeners = listenersRef;
    const activeDrag = dragRef;
    const pending = pendingRef;

    return () => {
      pending.current = null;
      if (timer.current !== 0) {
        window.clearTimeout(timer.current);
        timer.current = 0;
      }

      const currentListeners = listeners.current;
      if (currentListeners) {
        window.removeEventListener("pointermove", currentListeners.move);
        window.removeEventListener("pointerup", currentListeners.up);
        window.removeEventListener("pointercancel", currentListeners.up);
        listeners.current = null;
      }

      activeDrag.current = null;
    };
  }, []);

  return { listRef, drag, onItemPointerDown };
};
