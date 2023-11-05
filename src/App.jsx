import { useState } from "react";
import { NewTaskForm } from "./NewTaskForm";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState([]);

  //Dictionary to store the timeouts of different tasks in, in order to clear them when necessary
  const [timerDictionary, setTimerDictionary] = useState({});

  //Hooks for editing the task's title
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTask, setEditedTask] = useState("");

  //Hooks for editing the reminder time
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedReminder, setEditedReminder] = useState(null);

  //Handles the editing of a reminder
  const handleEditReminder = (taskId) => {
    setEditingTaskId(taskId);
    setEditedReminder(tasks.find((task) => task.id === taskId).reminder);
  };

  //Handles the updating of a reminder
  const handleUpdateReminder = (taskId) => {
    clearTimeout(timerDictionary[taskId]);
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          reminder: editedReminder,
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    addReminder(
      updatedTasks.find((task) => task.id === taskId).title,
      updatedTasks.find((task) => task.id === taskId).reminder,
      taskId
    );
    setEditingTaskId(null);
  };

  //Handles editing of a task title
  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditedTask(tasks[index].title);
  };

  //Handles saving a new edited task title, clears old timeout and creates a new one for the new title
  const handleSave = (index) => {
    clearTimeout(timerDictionary[tasks[index].id]);
    const updatedTasks = [...tasks];
    updatedTasks[index].title = editedTask;
    setTasks(updatedTasks);
    addReminder(
      updatedTasks[index].title,
      updatedTasks[index].reminder,
      updatedTasks[index].id
    );
    setEditingIndex(null);
  };

  // Function to add an item to the dictionary
  const addToDictionary = (key, value) => {
    setTimerDictionary((prevDictionary) => ({
      ...prevDictionary,
      [key]: value,
    }));
  };

  // Function to remove an item from the dictionary
  const removeFromDictionary = (key) => {
    const { [key]: removedItem, ...restOfDictionary } = timerDictionary;
    setTimerDictionary(restOfDictionary);
  };

  //Function to add tasks upon submitting
  //Transfered to NewTaskForm for use there
  function addTask(title, reminder) {
    const generatedId = crypto.randomUUID();
    setTasks((currentTasks) => {
      return [
        ...currentTasks,
        {
          id: generatedId,
          title,
          reminder,
          completed: false,
        },
      ];
    });
    addReminder(title, reminder, generatedId);
  }

  //Function to add a timeout for an alert
  function addReminder(title, reminder, generatedId) {
    const currentTime = new Date();
    const currentTimedOutTask = title;
    if (reminder == "") {
    } else if (reminder <= currentTime) {
      alert("Reminder set before current time. No reminder will be set.");
    } else {
      const timeDifference = reminder - currentTime;

      const timerId = setTimeout(() => {
        alert("Reminder for " + currentTimedOutTask);

        removeFromDictionary(generatedId);
      }, timeDifference);
      addToDictionary(generatedId, timerId);
    }
  }

  //If task gets checked then mark it as completed
  function checkTask(id, completed) {
    setTasks((currentTasks) => {
      return currentTasks.map((task) => {
        if (task.id === id) {
          return { ...task, completed };
        }
        return task;
      });
    });
  }

  //Deletes the task and clears the reminder timeout
  function deleteTask(id) {
    clearTimeout(timerDictionary[id]);
    removeFromDictionary(id);
    setTasks((currentTasks) => {
      return currentTasks.filter((task) => task.id !== id);
    });
  }

  //Checks all tasks, if any of them is completed deletes it
  function deleteCompleted() {
    tasks.forEach((task) => {
      if (task.completed === true) {
        deleteTask(task.id);
      }
    });
  }

  return (
    <>
      <div className="bg">
        <h1 className="header">ToDo List</h1>
        <NewTaskForm onSubmit={addTask}></NewTaskForm>
        <button onClick={() => deleteCompleted()} className="btn-deleteall">
          Delete all completed
        </button>
        <ul className="list-group">
          {tasks.length === 0 && "Nothing in tasks. Enjoy your empty tasklist."}
          {tasks.map((task, index) => {
            return (
              <li className="list-group-item" key={index}>
                <label>
                  {
                    <input
                      className="input"
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => checkTask(task.id, e.target.checked)}
                    />
                  }
                </label>
                {editingIndex === index ? (
                  <label>
                    <input
                      className="input"
                      type="text"
                      value={editedTask}
                      onChange={(e) => setEditedTask(e.target.value)}
                    />
                    <button
                      className="btn btn-success"
                      onClick={() => handleSave(index)}
                    >
                      Save
                    </button>
                  </label>
                ) : (
                  <b>
                    {task.title}
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(index)}
                    >
                      Edit
                    </button>
                  </b>
                )}

                <button
                  onClick={() => deleteTask(task.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
                {task.id === editingTaskId ? (
                  <div>
                    <DatePicker
                      selected={editedReminder}
                      onChange={(date) => setEditedReminder(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={5}
                      timeCaption="Time"
                      dateFormat="MMMM d, yyyy h:mm aa"
                    />
                    <button
                      onClick={() => handleUpdateReminder(task.id)}
                      className="btn-reminder"
                    >
                      Update
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="reminder-desc">Reminder at: </label>
                    {task.reminder ? (
                      <span>{task.reminder.toString()}</span>
                    ) : (
                      <span>No reminder set</span>
                    )}
                    <button
                      onClick={() => handleEditReminder(task.id)}
                      className="btn-reminder"
                    >
                      Edit Reminder
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
