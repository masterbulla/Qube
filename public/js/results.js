var electron = require("electron");
var fs = require("fs");
var remote = electron.remote;
var indexJs = remote.require("./index.js");
const app = remote.app;

var language = $('script[src*=results]').attr('data-language');

if (language === 'fi') {
    var descriptions = fiDescriptions;
    var details = fiDetails;
} else  // Default to english.
{
    var descriptions = enDescriptions;
    var details = enDetails;
}

var log = fs.readFileSync('public/logs/data.txt', 'utf8');

// Cut off all unnecessary stuff from the beginning until "Da, ... which is date object"
var start = "Da";
for (var index = 0; index < log.length; index++) {
    var sub = log.substr(index, start.length);
    if (sub === start) {
        log = log.slice(index, log.length);
        break;
    }
}
// And all the uncecessary from the end
for (var index = log.length; index > 0; index--) {
    var sub = log.substr(index, start.length);
    if (sub === "aH") {
        log = log.slice(0, index);
        break;
    }
}

var logKey = [];
var logVal = [];

var logPairs = {};

logArr = log.split(",")

// Divide log into keys and values
for (var index = 0; index < logArr.length; index++) {
    if (index % 2 == 0) {
        logKey.push(logArr[index]);
    }
    else {
        logVal.push(logArr[index]);
    }
}

// Create a JSON with pairs of keys and values
// ex. "Da" : "03/10/2017"
for (var index = 0; index < logKey.length; index++) {
    logPairs[logKey[index]] = logVal[index];
}

/* 
 * Declare the results to be shown.
 * Key - Result can be found in fi_descriptions.js and en_descriptions.js
*/
var header = ["Da", "TI", "AG", "Hm"];
var basicResults = ["Wk", "FW", "fW", "mW", "bW", "MI", "IF", "rA", "rB"];
var extensiveResults = ["Wk", "FW", "fW", "mW", "bW", "MI", "IF", "rA", "rB", "MW", "wW", "ww", "wI", "wO", "wo"];
var limbs = ["FR", "fR", "mR", "FL", "fL", "mL", "Fr", "fr", "mr", "Fl", "fl", "ml", "FT", "fT", "mT"];

/**
 * Adds the results to the page.
 * 
 * @param {array} resultKeys The keys of values to show.
 * @param {string} elementId The html element where to add the results. 
 */
function addResultsToPage(resultKeys, elementId) 
{
    var newParagraph;
    var resultArea = document.getElementById(elementId);

    for (var i = 0; i < resultKeys.length; i++)
    {
        let text = descriptions[resultKeys[i]] + ": " + logPairs[resultKeys[i]];
        let key = resultKeys[i];
        text = text.replace(/"/g, '');
        newParagraph = document.createElement("p");
        newParagraph.appendChild(document.createTextNode(text));
        newParagraph.addEventListener("click", function () { showModal(text, details[key]); });
        resultArea.appendChild(newParagraph);
        if (i >= basicResults.length && elementId === "extensive")
        {
            newParagraph.style.backgroundColor = "#ffc582"
        }
    }
}

/**
 * Hide an element
 * @param {string} divId The id of the element to hide.
 */
function hide(divId) {
    var div = document.getElementById(divId);
    div.style.display = "none";
}

/**
 * Display an element
 * @param {string} divId The id of the element to display. 
 */
function show(divId) {
    var div = document.getElementById(divId);
    div.style.display = "";
}

addResultsToPage(header, "resultsHeader");
addResultsToPage(basicResults, "results");
addResultsToPage(extensiveResults, "extensive");
addResultsToPage(limbs, "limbs");
// Show only basic on load
hide("limbs");
hide("extensive");

// Add listeners to buttons.

$("#basicsButton").on("click", function() {
    hide("limbs");
    hide("extensive");
    show("results");
});

$("#limbsButton").on("click", function() {
    hide("results");
    hide("extensive");
    show("limbs");
});

$("#extensivesButton").on("click", function() {
    hide("limbs");
    show("extensive");
});

/* 
    Set hidden inputs to the send email form.
    Collect values from elements with class toEmail
*/
var sendEmailForm = $("#email");
sendEmailForm.submit(function () {
    $(".loader").css("display", "inline-block");
    $("#sendEmailButton").attr("disabled", true);
    // Empty the form before filling.
    $("#email input[type='hidden']").remove();
    var i = 0;
    $(".toEmail p").each(function () {
        var result = $(this).html();
        var input = $("<input />", {
            name: i,
            value: result,
            type: "hidden"
        });
        sendEmailForm.append(input);
        i++;
    });
});

// EXIT BUTTON
function goHome() {
    window.location = "http://127.0.0.1:3000/";
    app.console.log("WAAWW")
}

function showModal(title, description) {
    $("#myModal .modal-title").html(title)
    $("#myModal .modal-body").html(description)
    $("#myModal").modal();
}

function showEmailModal() {
    $("#emailModal").modal();
}


$("#punkkia").on("click", function() {
    //showEmailModal(); Use it to send to printer instead, modal is commented out
    console.log("xxx");
    $("#email").submit();
});

// Custom modal functions because could not figure out how to display bs modal on load if condition is met.
var emailInfoModal = document.getElementById("emailInfoModal");
var emailInfoClose = document.getElementById("emailInfoClose");

// When the user clicks on <span> (x), close the modal
emailInfoClose.onclick = function() {
    emailInfoModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === emailInfoModal) {
        emailInfoModal.style.display = "none";
    }
} 
