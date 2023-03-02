import React, { useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css";

const MovableItem = ({ item, setTasks, index, moveCardHandler }) => {
  const changeItemColumn = (currentItem, columnName) => {
    setTasks((prev) => {
      return prev.map((obj) => {
        return {
          ...obj,
          where: obj.task === currentItem.task ? columnName : obj.where,
        };
      });
    });
  };

  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: "First Type",
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveCardHandler(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "First Type",
    item: () => {
      return item;
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      console.log("result after release", item);
      if (dropResult && dropResult.name === "Column 1") {
        changeItemColumn(item, "Column 1");
      } else changeItemColumn(item, "Column 2");
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;

  drag(drop(ref));

  return (
    <div ref={ref} className="movable-item" style={{ opacity }}>
      {item?.task}
    </div>
  );
};

// const FirstColumn = () => {
//   return (
//     <div className="column first-column">
//       Column 1
//       <MovableItem />
//     </div>
//   );
// };

// const SecondColumn = () => {
//   const [{ canDrop, isOver }, drop] = useDrop({
//     accept: "First Type",
//     drop: () => ({ name: "Some" }),
//     collect: (monitor) => ({
//       isOver: monitor.isOver(),
//       canDrop: monitor.canDrop(),
//     }),
//   });

//   console.log("Options", { canDrop, isOver });

//   return (
//     <div ref={drop} className="column second-column">
//       Column 2
//     </div>
//   );
// };

const Column = ({ children, className, title }) => {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: "First Type",
    drop: () => ({ name: title }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // console.log("options", { canDrop, isOver });

  return (
    <div ref={drop} className={className}>
      <p>{title}</p>
      {children}
    </div>
  );
};

const App = () => {
  // const [isFirstColumn, setIsFirstColumn] = useState(true);
  // const Item = <MovableItem setIsFirstColumn={setIsFirstColumn} />;
  const [tasks, setTasks] = useState([
    {
      id: 1,
      task: "Learn Dsa",
      where: "Column 1",
    },
    {
      id: 2,
      task: "Learn Backend",
      where: "Column 1",
    },
    {
      id: 3,
      task: "Learn Fontend",
      where: "Column 1",
    },
  ]);

  const moveCardHandler = (dragIndex, hoverIndex) => {
    console.log("drag index", dragIndex);
    console.log("hover index", hoverIndex);
  };

  const renderMultiple = (columnName) => {
    return tasks
      .filter((task) => task.where === columnName)
      .map((obj, index) => (
        <MovableItem
          key={obj.id}
          item={obj}
          setTasks={setTasks}
          moveCardHandler={moveCardHandler}
          index={index}
        />
      ));
  };

  return (
    <div className="container">
      <DndProvider backend={HTML5Backend}>
        <Column title="Column 1" className="column first-column">
          {renderMultiple("Column 1")}
        </Column>
        <Column title="Column 2" className="column second-column">
          {renderMultiple("Column 2")}
        </Column>
      </DndProvider>
    </div>
  );
};

export default App;
