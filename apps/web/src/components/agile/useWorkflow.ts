import { useMachine } from '@xstate/react';
import type { Lane, Task} from './workMachine';
import { workMachine } from './workMachine';

export const useWorkflow = () => {
  const [state, send] = useMachine(workMachine);
  const addTask = (task: Task) => {
    send({
      type: 'ADD_TASK',
      task
    });
  }
  const removeTask = (taskId: string) => {
    send({
      type: 'REMOVE_TASK',
      taskId
    });
  };
  const addLane = (lane: Lane) => {
    send({
      type: 'ADD_LANE',
      lane
    });
  }
  const removeLane = (laneId: string) => {
    send({
      type: 'REMOVE_LANE',
      laneId
    });
  };
  const clearTasks = () => {
    send({
      type: 'CLEAR_TASKS'
    });
  }
  const start = () => {
    send({ type: 'START'});
  }
  const stop = () => {
    send({ type: 'STOP'});
  }
  return {
    state,
    addTask,
    removeTask,
    clearTasks,
    addLane,
    removeLane,
    start,
    stop
  };
}
