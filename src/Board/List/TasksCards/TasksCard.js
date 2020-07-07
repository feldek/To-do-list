import React, { useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { uuid } from "uuidv4";
import { useSelector, useDispatch } from "react-redux";
import NewList from "../NewList";
import List from "../List";
import {
  setTaskState,
  deleteTask,
} from "../../../Data/TaskReducer";
import { useParams, useRouteMatch, Link } from "react-router-dom";
import NewTask from "./NewTask";
import PageNotFound from "../../PageNotFound";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import useLocalStorage from "local-storage-hook";
import { Card } from "antd";
import "./TasksCards.css";
import s from "./TasksCards.module.css";
import { deleteDescription } from "../../../Data/DescriptionReducer";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};
const grid = 7;

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  // padding: grid,
  // paddingLeft: 2 * grid,
  margin: `${grid + 1}px`,
  background: isDragging ? "#c2dcf7" : "#e1f0ff",
  ...draggableStyle,
});
const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "#ffffffd0" : "#ffffffd0",
  padding: grid,
});

let TasksCards = () => {
  const params = useParams();
  const boardId = params.boardId;
  let match = useRouteMatch();
 
  const [localDataUserTask, setLocalDataUserTask] = useLocalStorage(
    "dataUserTask"
  );

  const dispatch = useDispatch();
  const stateList = useSelector((state) => state.lists);
  const listFilter = stateList
    ? stateList.filter((elem) => elem.boardId === boardId)
    : [];
  let listsId = listFilter.map((el) => el.id);
  let allState = useSelector((state) => state.tasks);
 
  let state = useSelector((state) => state.tasks);
  state = state ? state.filter((item) => listsId.includes(item[0].listId)) : [];

  useEffect(() => {
    setLocalDataUserTask(allState);
  }, [allState]);

  if (
    !useSelector((state) => state.boards).find((elem) => elem.id === boardId)
  ) {
    return <PageNotFound />;
  }
  function onDragEnd(result) {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;

      dispatch(setTaskState(newState, listsId));
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      let listId = result[dInd][result[dInd].length - 1].listId;
      newState[dInd] = result[dInd].map(
        (elem, ind) =>
          (elem =
            ind === destination.index
              ? { id: elem.id, name: elem.name, listId: listId }
              : elem)
      );
      dispatch(
        setTaskState(
          newState.filter((group) => group.length),
          listsId
        )
      );
    }
  }

  return (
    <Card title={""} className={s.totalCard}>
      <DragDropContext onDragEnd={onDragEnd}>
        {
          state &&
            // {
            state.map(
              (el, ind) =>
                el.length !== 0 &&
                listFilter.find((elem) => elem.id === el[0].listId) && (
                  <Card.Grid key={`boxList${el[0].listId}`} className={s.card}>
                    <Card
                      className={s.tasksHeader}
                      key={`listone${el[0].listId}`}
                      title={
                        <div key={`headerCard${el[0].listId}`}>
                          <List
                            listId={el[0].listId}
                            key={`lists${el[0].listId}`}
                          />
                          <NewTask
                            stateTasks={state}
                            listsId={listsId}
                            listId={el[0].listId}
                            uuid={uuid()}
                            key={`newTask${el[0].listId}`}
                          />
                        </div>
                      }
                    >
                      <Droppable
                        droppableId={`${ind}`}
                        key={`droppable${el[0].listId}`}
                      >
                        {(provided, snapshot) => (
                          <div
                            key={`tasks${el[0].listId}`}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            {...provided.droppableProps}
                            style={{ width: "100%" }}
                          >
                            {el.map((item, index) => (
                              <div key={`task${item.id}`}>
                                {item.name !== "" && (
                                  <div key={`boxdragable${item.id}`}>
                                    <Draggable
                                      key={item.id}
                                      draggableId={item.id}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          key={`boxTask${item.id}`}
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={getItemStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style
                                          )}
                                          className={s.taskContainer}
                                        >
                                          <button
                                            key={`buttons${item.id}`}
                                            className={s.buttonTaskDelete}
                                            type="button"
                                            onClick={() => {
                                              dispatch(
                                                deleteTask(
                                                  item.id, 
                                                  item.listId
                                                )
                                              );
                                            }}
                                          >
                                            <FontAwesomeIcon
                                              key={`icon${item.id}`}
                                              icon={faTimes}
                                              style={{
                                                fontSize: "28px",
                                                padding: "4px",
                                              }}
                                            />
                                          </button>
                                          <Link
                                            to={`${match.url}/description/${item.id}`}
                                            key={`content${item.id}`}
                                            className={s.taskText}
                                          >
                                            {item.name}
                                          </Link>
                                        </div>
                                      )}
                                    </Draggable>
                                  </div>
                                )}
                              </div>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </Card>
                  </Card.Grid>
                )
            )
          // }
        }
        <Card.Grid className={s.card}>
          <NewList />
        </Card.Grid>
      </DragDropContext>
    </Card>
  );
};

export default TasksCards;
