import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import s from "./Boards.module.css";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import NewBoard from "./NewBoard";
import { deleteBoard } from "../Data/BoardReducer";
import useLocalStorage from "local-storage-hook";
import { deleteListsBoard } from "../Data/ListReducer";
import { deleteTaskBoard } from "../Data/TaskReducer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Card } from "antd";

let Boards = (props) => {
  const dispatch = useDispatch();
  const stateBoard = useSelector((state) => state.boards);
  const [localDataUserBoard, setLocalDataUserBoard] = useLocalStorage(
    "dataUserBoard"
  );
  const [localDataUserList, setLocalDataUserList] = useLocalStorage(
    "dataUserList"
  );
  const [localDataUserTask, setLocalDataUserTask] = useLocalStorage(
    "dataUserTask"
  );
  const stateList = useSelector((state) => state.lists);
  const stateTask = useSelector((state) => state.tasks);
  useEffect(() => {
    setLocalDataUserBoard(stateBoard);
  }, [stateBoard]);
  useEffect(() => {
    setLocalDataUserList(stateList);
  }, [stateList]);
  useEffect(() => {
    setLocalDataUserTask(stateTask);
  }, [stateTask]);
  return (
    <div className={s.content}>
      <Card title={<NewBoard />}>
        <div className={s.boards}>
          {useSelector((state) => state.boards).map((elem) => (
            <Card.Grid
              key={`board${elem.id}`}
              className={s.boxBoard}
              style={{ padding: 0, width: "33.33%" }}
            >
              <button
                key={`boardButton${elem.id}`}
                className={s.button}
                data-title="delete"
                onClick={() => (
                  dispatch(deleteBoard(elem.id)),
                  dispatch(deleteListsBoard(elem.id)),
                  stateList
                    .filter((el) => el.boardId === elem.id)
                    .forEach((element) => {
                      dispatch(deleteTaskBoard(element.id));
                    })
                )}
              >
                <FontAwesomeIcon icon={faTimes} style={{ fontSize: "20px" }} />
              </button>
              <Link
                to={`/board/${elem.id}`}
                key={`board${elem.id}`}
                className={s.boardLink}
              >
                {elem.name}
              </Link>
            </Card.Grid>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Boards;
