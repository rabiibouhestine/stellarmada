class Timer {
    constructor(duration, update) {
      this.callback = callback;
      this.duration = duration;
      this.timerId = null;
      this.isRunning = false;
      this.timeLeft = this.duration;
      this.update = update;
    }

    start() {
      if (!this.isRunning) {
        this.isRunning = true;
        this.timerId = setInterval(() => {
          this.timeLeft -= 1000; // Subtract one second
          this.update(this.timeLeft);
          if (this.timeLeft <= 0) {
            this.stop();
          }
        }, 1000);

      }
    }
  
    stop() {
      if (this.isRunning) {
        clearInterval(this.timerId);
        this.isRunning = false;
      }
    }
  
    reset(newDuration = null, start = false) {
      this.stop();
      if (newDuration !== null) {
        this.duration = newDuration;
      }
      this.timeLeft = this.duration;
      this.update(this.timeLeft);
      if (start) {
        this.start();
      }
    }
}

export default Timer;
