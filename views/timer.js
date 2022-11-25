function getTimeRemaining(endtime) {
    const total = Date.parse(endtime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);

    return {
        total,
        minutes,
        seconds
    };
}

function initializeClock(id, endtime) {
    const clock = document.getElementById(id);
    const minutesSpan = clock.querySelector('.minutes');
    const secondsSpan = clock.querySelector('.seconds');

    function updateClock() {
        const t = getTimeRemaining(endtime);

        minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
        secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

        if (t.total <= 0) {
            clearInterval(timeinterval);
        }
    }

    updateClock();
    const timeinterval = setInterval(updateClock, 1000);
}

let deadline;
// if there's a cookie with the name myClock, use that value as the deadline
if (document.cookie && document.cookie.match('myClock')) {
    // get deadline value from cookie
    deadline = document.cookie.match(/(^|;)myClock=([^;]+)/)[2];
} else {
    // otherwise, set a deadline 3 minutes from now and 
    // save it in a cookie with that name

    // create deadline 3 minutes from now
    const timeInMinutes = 3;
    const currentTime = Date.parse(new Date());
    deadline = new Date(currentTime + timeInMinutes * 60 * 1000);

    // store deadline in cookie for future reference
    document.cookie = 'myClock=' + deadline + '; path=/';
}
initializeClock('clockdiv', deadline);