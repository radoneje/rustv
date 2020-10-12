function concat(a, b){
    return a+b;
}
var getRemainingInfo = function getRemainingInfo(countDownDate) {
    var now = new Date().getTime();
    var timeleft = countDownDate - now;
    var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
    var hours = Math.floor(timeleft % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
    var minutes = Math.floor(timeleft % (1000 * 60 * 60) / (1000 * 60));
    var seconds = Math.floor(timeleft % (1000 * 60) / 1000);
    return {    days: days,    hours: hours,    minutes: minutes,    seconds: seconds  };};
var getNumberWithPrependedZeroIfNeeded = function getNumberWithPrependedZeroIfNeeded(number) {
    return number > 9 ? number : "0".concat(number);};
  var updateTime = function updateTime(countDownDate) {
      var _getRemainingInfo = getRemainingInfo(countDownDate);
          days = _getRemainingInfo.days;
          hours = _getRemainingInfo.hours;
          minutes = _getRemainingInfo.minutes;
          seconds = _getRemainingInfo.seconds;
          var daysPostfix = 'День';  if (days < 5 && days > 1) {    daysPostfix = 'д';  } else if (days === 1) {    daysPostfix = 'День';  }
          if (days > 0 || hours > 0 && minutes > 0 && seconds > 0) {    document.getElementById('days').textContent = concat(days, " ").concat(daysPostfix);
          document.getElementById('time').textContent = concat(getNumberWithPrependedZeroIfNeeded(hours), ":") + concat(getNumberWithPrependedZeroIfNeeded(minutes), ":")+ concat(getNumberWithPrependedZeroIfNeeded(seconds));  }
  };


document.addEventListener('DOMContentLoaded', function () {
    var countDownDate = new Date('Sep 30, 2020 10:00:00').getTime();
    setInterval(function () {
        updateTime(countDownDate);
    },1000)

});




