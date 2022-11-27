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
    const timeinterval = setInterval(updateClock, 1000);

    function updateClock() {
        const t = getTimeRemaining(endtime);

        minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
        secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

        if (t.total <= 0) {
            clearInterval(timeinterval);
        }
    }

    updateClock();
    
}

function prepareNewCookie(timeInMinutes){
    const currentTime = Date.parse(new Date());
    deadline = new Date(currentTime + timeInMinutes * 60 * 1000);

    // store deadline in cookie for future reference
    document.cookie = "myClock=" + deadline + "; path=/";
}

let deadline;
// if there's a cookie with the name myClock, use that value as the deadline
if (document.cookie && document.cookie.match('myClock')) {
    // get deadline value from cookie
    deadline = document.cookie.match(/(^|;)myClock=([^;]+)/)[2];
    if (getTimeRemaining(deadline).total <= 0) {
        document.cookie = "myClock=" + deadline + "; expires=Thu, 21 Aug 2014 20:00:00 UTC "; 
        prepareNewCookie(3);
    }
} else prepareNewCookie(3);

initializeClock('clockdiv', deadline);