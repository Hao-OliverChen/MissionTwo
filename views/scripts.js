// handle submit
const handleSubmit = function (e) {
    let text = "Are you sure you want to choose this candidate?";
    var radios = document.getElementsByName('candidate');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            // get the value
            citizen_choice = radios[i].value;
            console.log(citizen_choice)
            // only one radio can be logically checked, don't check the rest
            break;
        }
    }
    if (confirm(text)) {
        // send request
        const json = { candidate: citizen_choice },
            body = JSON.stringify(json)

        fetch('/vote-submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
        })
    } else {
        e.preventDefault()
    }
}