const timeTypes = {
  "hours": "hours",
  "hour": "hour",
  "minutes": "minutes",
  "minute": "minute",
  "seconds": "seconds",
  "second": "second"
};

const editTime = (time, timeTypes) => {
  let result = null;
  if (time < 60) {
    switch (time) {
      case 1:
      result = `${time} ${timeTypes.second}`;
      break;
      default:
      result = `${time} ${timeTypes.seconds}`;
      break;
    }
  } else if (time > 59 && time < 3600) {
    let minutes = Math.floor(time / 60);
    let seconds = time - (Math.floor(time / 60) * 60);
    switch (minutes) {
      case 1:
      result = `${minutes} ${timeTypes.minute}`;
      break;
      default:
      result = `${minutes} ${timeTypes.minutes}`;
      break;
    }
    switch (seconds) {
      case 0:
        break;
      case 1:
        result += ` ${seconds} ${timeTypes.second}`;
        break;
      default:
        result += ` ${seconds} ${timeTypes.seconds}`;
        break;
    }
  } else if (time > 3599) {
    time = Math.floor(time / 60);
    let hours = Math.floor(time / 60);
    let minutes = time % 60;
    switch (hours) {
      case 0:
        break;
      case 1:
        result = `${hours} ${timeTypes.hour}`;
        break;
      default:
        result = `${hours} ${timeTypes.hours}`;
        break;
    }
    switch (minutes) {
      case 0:
      break;
      case 1:
      result += ` ${minutes} ${timeTypes.minute}`;
      break;
      default:
      result += ` ${minutes} ${timeTypes.minutes}`;
      break;
    }
  }
  return result;
}

module.exports.editTime = editTime;
module.exports.timeTypes = timeTypes;
