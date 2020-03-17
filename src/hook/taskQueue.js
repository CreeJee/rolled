class Timer {
    // @ts-ignore
    constructor(addTimer, removeTimer) {
        this.timer = -1;
        this.addTimer = addTimer;
        this.removeTimer = removeTimer;
    }
    boundTask(task) {
        if (this.timer >= 0) {
            this.removeTimer(this.timer);
        }
        this.timer = this.addTimer(task);
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
    constructor(timer) {
        this.tasks = [];
        this.timer = timer;
        this.boundExec = this.exec.bind(this);
    }
    add(task, ...param) {
        if (typeof task !== "function") {
            //@TODO: taskQueue must contains Own Error
            throw new Error("[TaskQueue] Task is must Function");
        }
        this.tasks.push({ task, param });
        this.timer.boundTask(this.boundExec);
    }
    exec() {
        for (const { task, param } of this.tasks.splice(0)) {
            task(param);
        }
    }
}

export const getAnimationQueue = () => new TaskQueue(new AnimationTimer());
export const getTimerQueue = () => new TaskQueue(new StateTimer());
export const getIdleQueue = () => new TaskQueue(new IdleTimer());
