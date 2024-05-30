'use client';
import { StyleHTMLAttributes, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useSprings, animated, useTransition, useSpringRef, useChain } from '@react-spring/web';
import { IconTrash } from '@tabler/icons-react';
import { useWorkflow } from './useWorkflow';
import type { Lane} from './workMachine';
import { Task } from './workMachine';

const Button: React.FC<React.HTMLAttributes<HTMLButtonElement>> = ({children, ...props}) => (
  <button
    className="cursor-pointer rounded-sm border bg-gray-200 px-2 py-1 hover:bg-gray-300"
    type="button"
    {...props}
  >
    {children}
  </button>
)

export const Workflow: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const {
    addTask,
    removeTask,
    clearTasks,
    addLane,
    removeLane,
    start,
    stop,
    state
  } = useWorkflow();

  const lanes = [{
    id: 'backlog',
    title: 'Backlog'
  }, ...state.context.lanes];

  const laneTransRef = useSpringRef();

  const transitionLanes = useTransition(lanes, {
    ref: laneTransRef,
    keys: (lane) => lane.id,
    from: (lane) => {
      const position = state.context.lanes.findIndex(l => l.id === lane.id) + 1;
      return ({
        width: 0,
        height: 10,
        x: 10,
        y: position * 10,
        fill: 'lightblue'
      });
    },
    enter: (lane) => ({
      width: 80,
    }),
    leave: (lane) => ({ x: 0, y: 0, fill: 'blue' }),
  });

  const taskTransRef = useSpringRef();

  const transitionTasks = useTransition(state.context.tasks, {
    ref: taskTransRef,
    keys: (task) => task.id,
    from: (task) => {
      const position = state.context.tasks.findIndex(t => t.id === task.id) + 1;
      return ({
        height: 8,
        width: 0,
        x: 6 + (position * 5),
        y: 1,
        fill: task.type === 'story' ? 'green' : 'red'
      });
    },
    enter: (task) => ({
      width: 3,
    }),
    update: (task) => {
      const position = state.context.tasks.findIndex(t => t.id === task.id) + 1;
      return ({
        x: 6 + (position * 5),
      });
    },
    leave: (task) => ({
      width: 0,
      fill: 'black'
    }),
  });

  const addStory = () => {
    addTask({
      id: (Math.random() * 100).toString(36),
      type: 'story',
      age: 0,
      completed: false,
      title: 'New Story'
    });
  }

  const addBug = () => {
    addTask({
      id: (Math.random() * 100).toString(36),
      type: 'bug',
      age: 0,
      completed: false,
      title: 'New Bug'
    });
  }

  useChain([laneTransRef, taskTransRef]);


  return (
    <div>
      <h1>Workflow ({state.context.hours})</h1>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button onClick={addStory}>Add Story</Button>
          <Button onClick={addBug}>Add Bug</Button>
          <Button onClick={clearTasks}>Clear</Button>
          <Button onClick={start}>Start</Button>
          <Button onClick={stop}>Stop</Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              const landeId = `lane${state.context.lanes.length + 1}`;
              addLane({ id: landeId, title: 'Lane' });
            }}
          >
          Add Lane
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div>
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>name</th>
                <th>age</th>
              </tr>
            </thead>
            <tbody>
              {state.context.tasks.map(task => (
                <tr key={task.id}>
                  <td>
                    <span className="flex items-center gap-2">
                      <IconTrash
                        className="cursor-pointer"
                        onClick={() => { removeTask(task.id); }}
                        size={16}
                      />
                      {task.id}
                    </span>
                  </td>
                  <td>{task.title}</td>
                  <td>{task.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <svg ref={svgRef} viewBox="0 0 100 100">
            {transitionLanes((props, lane) => (
              <animated.rect
                key={lane.id}
                {...props}
              />
            ))}
            {transitionTasks((props, task) => (
              <animated.rect
                key={task.id}
                {...props}
              >
                <title>{task.title}</title>
              </animated.rect>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
