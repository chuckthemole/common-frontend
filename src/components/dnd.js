// import React from 'react';
// import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

// function Draggable() {
//   const { attributes, listeners, setNodeRef, transform } = useDraggable({
//     id: 'draggable',
//   });

//   const style = {
//     transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
//       Drag me!
//     </div>
//   );
// }

// function Droppable() {
//   const { isOver, setNodeRef } = useDroppable({
//     id: 'droppable',
//   });

//   const style = {
//     backgroundColor: isOver ? 'green' : 'red',
//     width: 200,
//     height: 200,
//   };

//   return <div ref={setNodeRef} style={style}>Drop here!</div>;
// }

// export default function App() {
//   return (
//     <DndContext>
//       <Draggable />
//       <Droppable />
//     </DndContext>
//   );
// }
