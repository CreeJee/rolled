type Task = (...args: any[]) => void;
type TaskInfo = {
    task: Task;
    param: any[];
};
type createTimer = (fn: Task) => number;
type deleteTimer = (timerId: number) => void;
class Timer {
    timer: number;
    #create: createTimer;
    #delete: deleteTimer;
    // @ts-ignore
    constructor(createTimer: createTimer, deleteTimer: deleteTimer) {
        this.timer = -1;
        this.#create = createTimer;
        this.#delete = deleteTimer;
    }
    boundTask(task: Task) {
        if (this.timer >= 0) {
            this.#delete(this.timer);
        }
        this.timer = this.#create(task);
    }
}
class AnimationTimer extends Timer {
    constructor() {
        super(
            (fn) => window.requestAnimationFrame(fn),
            (timer) => window.cancelAnimationFrame(timer)
        );
    }
}
class StateTimer extends Timer {
    constructor() {
        super(
            (fn) => window.setTimeout(fn, 0),
            (timer) => window.clearTimeout(timer)
        );
    }
}
class IdleTimer extends Timer {
    constructor() {
        super(
            (fn) => window.requestIdleCallback(fn),
            (timer) => window.cancelIdleCallback(timer)
        );
    }
}
class TaskQueue {
    tasks: TaskInfo[];
    timer: any;
    boundExec: () => void;
    constructor(timer: Timer) {
        this.tasks = [];
        this.timer = timer;
        this.boundExec = this.exec.bind(this);
    }
    add(task: TaskInfo["task"], ...param: TaskInfo["param"]) {
        this.tasks.push({ task, param });
        this.timer.boundTask(this.boundExec);
    }
    exec() {
        for (const { task, param } of this.tasks.splice(0)) {
            task(...param);
        }
    }
}

export const getAnimationQueue = () => new TaskQueue(new AnimationTimer());
export const getTimerQueue = () => new TaskQueue(new StateTimer());
export const getIdleQueue = () => new TaskQueue(new IdleTimer());
