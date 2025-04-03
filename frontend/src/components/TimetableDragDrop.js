import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Initial data
const initialData = {
  "Semester 1": ["CITS5501", "CITS5505", "CITS5551", "CITS5100"],
  "Semester 2": ["CITS6001", "CITS5206", "CITS5552", "CITS6101"],
  "Semester 3": ["CITS6201", "CITS6202", "CITS6301", "CITS6302"],
  "Semester 4": ["CITS6401", "CITS6402", "CITS6501", "CITS6502"]
};

// Droppable semester
function DroppableColumn({ semester, children }) {
  const { setNodeRef } = useDroppable({
    id: semester
  });

  return (
    <div ref={setNodeRef} className="semester-card">
      <h2 className="semester-title">{semester}</h2>
      {children}
    </div>
  );
}

// Draggable unit
function DraggableUnit({ id, semester }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      data: { semester }
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="unit-pill"
    >
      {id}
    </div>
  );
}

// Main component
export default function TimetableDragDrop() {
  const [semesters, setSemesters] = useState(initialData);
  const [activeUnit, setActiveUnit] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveUnit(active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveUnit(null);

    if (!over || !active?.data?.current) return;

    const fromSemester = active.data.current.semester;
    const draggedUnit = active.id;

    // Figure out which semester was hovered over
    let toSemester = null;
    for (const [semester, units] of Object.entries(semesters)) {
      if (units.includes(over.id)) {
        toSemester = semester;
        break;
      }
    }

    // Fallback: dropped into an empty column
    if (!toSemester && semesters[over.id]) {
      toSemester = over.id;
    }

    if (
      !fromSemester ||
      !toSemester ||
      fromSemester === toSemester ||
      !semesters[toSemester]
    ) {
      return;
    }

    const fromList = semesters[fromSemester].filter((u) => u !== draggedUnit);
    const toList = [...semesters[toSemester], draggedUnit];

    setSemesters({
      ...semesters,
      [fromSemester]: fromList,
      [toSemester]: toList
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="timetable-container">
        {Object.entries(semesters).map(([semester, units]) => (
          <DroppableColumn key={semester} semester={semester}>
            <SortableContext items={units} strategy={verticalListSortingStrategy}>
              {units.map((unit) => (
                <DraggableUnit key={unit} id={unit} semester={semester} />
              ))}
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>

      {/* Optional drag overlay */}
      <DragOverlay>
        {activeUnit && (
          <div className="unit-pill" style={{ opacity: 0.8 }}>
            {activeUnit}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
