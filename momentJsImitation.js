const editTime = (time) => {
  if (time < 60) {
    return `${time} seconds`;
  } else if (time > 59 && time < 3600) {
    let minutes = Math.floor(time / 60);
    let seconds = (time - (time / 60)) * 60;
    console.log(seconds);
    switch (seconds) {
      case 0:
        return `${minutes} minutes`;
      default:
        return `${minutes} minutes ${seconds} seconds`
    }
  } else if (time > 3599) {
    time = Math.floor(time / 60);
    let hours = Math.floor(time / 60);
    let minutes = time % 60;
    switch (minutes) {
      case 0:
        return `${hours} hours`;
      default:
        return `${hours} hours ${minutes} minutes`;
    }
  }
}

module.exports = editTime;