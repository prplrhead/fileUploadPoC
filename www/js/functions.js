var errorMsg = "";
var debugMode = true;
var Utility = {
    formatTime: function (milliseconds) {
        if (milliseconds <= 0)
            return '00:00';

        var seconds = Math.round(milliseconds);
        var minutes = Math.floor(seconds / 60);
        if (minutes < 10)
            minutes = '0' + minutes;

        seconds = seconds % 60;
        if (seconds < 10)
            seconds = '0' + seconds;

        return minutes + ':' + seconds;
    },
    endsWith: function (string, suffix) {
        return string.indexOf(suffix, string.length - suffix.length) !== -1;
    }
};
var Player = {
    media: null,
    mediaTimer: null,
    isPlaying: false,
    duration: -1,
    initMedia: function (path) {
        Player.media = new Media(
           path,
           function () {
               console.log('Media file read succesfully');
               if (Player.media !== null) {
                   Player.media.release();
               }
               //Player.resetLayout();
           },
           function (error) {
               alert(
                  'Unable to read the media file'
               );
               Player.changePlayButton('recording_play');
               console.log('Unable to read the media file (Code): ' + error.code);
           }
        );
    },
    playPause: function (path) {
        if (Player.media === null) {
            Player.initMedia(path);
        }
        if (Player.isPlaying === false) {
            Player.media.play();
            Player.mediaTimer = setInterval(
               function () {
                   Player.media.getCurrentPosition(
                      function (position) {
                          if (position > -1) {
                              $('#media-played').text(Utility.formatTime(position));
                              Player.updateSliderPosition(position);
                          }
                      },
                      function (error) {
                          console.log('Unable to retrieve media position: ' + error.code);
                          $('#media-played').text(Utility.formatTime(0));
                      }
                   );
               },
               1000
            );
            var counter = 0;
            var timerDuration = setInterval(
               function () {
                   counter++;
                   if (counter > 20)
                       clearInterval(timerDuration);

                   var duration = Player.media.getDuration();
                   if (duration > -1) {
                       clearInterval(timerDuration);
                       $('#media-duration').text(Utility.formatTime(duration));
                       $('#time-slider').attr('max', Math.round(duration));
                       $('#time-slider').slider('refresh');
                   }
                   else
                       $('#media-duration').text('Unknown');
               },
               100
            );
            Player.changePlayButton('recording_pause');
        }
        else {
            Player.media.pause();
            clearInterval(Player.mediaTimer);
            Player.changePlayButton('recording_play');
        }
        Player.isPlaying = !Player.isPlaying;
    },
    stop: function () {
        if (Player.media !== null) {
            Player.media.stop();
            //Player.media.release();
        }
        clearInterval(Player.mediaTimer);
        //Player.media = null;
        Player.isPlaying = false;
        Player.resetLayout();
    },
    recordStart: function () {
        if (!Player.isPlaying) {
            if (Player.media == null) {
                var src = "new_recording.wav";
                Player.initMedia(src);
            }
            Player.media.startRecord();

            Player.mediaTimer = setInterval(function () {
                Player.duration++;
                $('#media-played').text(Utility.formatTime(Player.duration));
            }, 1000);
        } else {
            clearInterval(Player.mediaTimer);
            Player.media.stopRecord();
        }
        Player.isPlaying = !Player.isPlaying;
    },
    resetLayout: function () {
        $('#media-played').text(Utility.formatTime(0));
        Player.changePlayButton('recording_play');
        Player.updateSliderPosition(0);
    },
    updateSliderPosition: function (seconds) {
        var $slider = $('#time-slider');

        if (seconds < $slider.attr('min'))
            $slider.val($slider.attr('min'));
        else if (seconds > $slider.attr('max'))
            $slider.val($slider.attr('max'));
        else
            $slider.val(Math.round(seconds));

        $slider.slider('refresh');
    },
    seekPosition: function (seconds) {
        if (Player.media === null)
            return;

        Player.media.seekTo(seconds * 1000);
        Player.updateSliderPosition(seconds);
    },
    changePlayButton: function (imageName) {
        var background = $('#player-play')
        .css('background-image')
        .replace('url(', '')
        .replace(')', '');

        $('#player-play').css(
           'background-image',
           'url(' + background.replace(/images\/.*\.png$/, 'images/' + imageName + '.png') + ')'
        );
    }
};

function showPopup(div, closetime) {

    //$.getScript("js/jquery.mobile-1.4.3.js");
    //if (typeof closetime == 'undefined') {
    //    closetime = 2000;
    //}
    $(div).popup("open", { overlayTheme: "a" });
    //if(closetime) setTimeout(function () { $(div).popup("close") }, closetime);
}

function hidePopup(div) {

    if ($(div)) {
        $(div).popup("close");
    }
}

function loadRecording(path) {

    Player.initMedia(path);
    /*
    var frm = document.createElement("form");
    var sliderDuration = document.createElement("input");
    sliderDuration.type = "hidden";
    sliderDuration.name = "sliderDuration";
    sliderDuration.value = Utility.formatTime(duration);
    frm.appendChild(sliderDuration);
    var sliderMax = document.createElement("input");
    sliderMax.type = "hidden";
    sliderMax.name = "sliderMax";
    sliderMax.value = Math.round(duration);
    frm.appendChild(sliderMax);
    document.body.appendChild(frm);
    */
}

function setDuration() {

    var counter = 0;
    var timerDur = setInterval(function () {
        counter = counter + 100;
        if (counter > 2000) {
            clearInterval(timerDur);
        }
        var dur = Player.media.getDuration();
        if (dur > -1) {
            clearInterval(timerDur);
            Player.duration = dur;
        }
    }, 100);
}

function pageAction(action, element) {

    switch (action) {
        case "login":
            break;
        case "loadRecording":
            var rid = element.attr("data-value");
            loadRecording("http://mobile.thevoicelibrary.net/Download.aspx?rid=" + rid);
            //document.addEventListener("pageLoaded", function () { alert(Player.duration); document.removeEventListener("pageLoaded", arguments.callee, false) }, false);
            //document.addEventListener("playerInitialized", function () { setDuration(); document.removeEventListener("playerInitialized", this, false) }, false);
            //document.addEventListener("pageLoaded", function () { setDuration(); document.removeEventListener("pageLoaded", this, false) }, false);
            break;
        case "playRecording":
            Player.playPause();
            break;
        case "stopRecording":
            Player.stop();
            break;
        case "startRecording":
            Player.recordStart();
            break;
    }
}

function serviceRequest(parms, busyMsg) {

    var xmlhttp = new XMLHttpRequest();
    var postParms = "";
    var result = "";
    var divError = document.getElementById("pError");
    var divBusy = document.getElementById("pBusyMsg");
    var divMain = document.getElementById("divMain");
    var frmMain = document.getElementById("frmMain");
    var btnSubmit = document.getElementById("btnSubmit");

    if (btnSubmit) { btnSubmit.disabled = true; }
    if (busyMsg) {
        try{
            divBusy.innerHTML = busyMsg;
            showPopup("#divBusyMsg");
        } catch (err) {
            if (debugMode) {
                if (errorMsg) errorMsg = "App Message: " + errorMsg + "\n";
                errorMsg += "Error Code: 001\nSystem Message: " + err.message;
                alert(errorMsg);
                errorMsg = "";
            } else {
                alert("There was a problem loading the requested page");
                return;
            }
        }
    } else {
        divBusy.innerHTML = "";
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

            try {
                result = JSON.parse(xmlhttp.responseText);
            }catch(err){
                alert("There was a problem loading the requested page");
                return;
            }

            if (result.error) {
                errorMsg = result.error;
                if (btnSubmit) { btnSubmit.disabled = false; }
            } else {
                errorMsg = "";
            }
            $("#pError").text = errorMsg;

            if (result.form && frmMain) { frmMain.innerHTML = result.form; }

            if (result.main && divMain) { divMain.innerHTML = result.main; }

            if (btnSubmit) { btnSubmit.disabled = false; }

            try {
                $("#divPage").trigger("create");
            } catch (err) {
                if (debugMode) {
                    if (errorMsg) errorMsg = "App Message: " + errorMsg + "\n";
                    errorMsg += "Error Code: 004\nSystem Message: " + err.message;
                    alert(errorMsg);
                    errorMsg = "";
                } else {
                    alert("There was a problem loading the requested page");
                    return;
                }
            }

            try {
                hidePopup("#divBusyMsg");
            } catch (err) {
                if (debugMode) {
                    if (errorMsg) errorMsg = "App Message: " + errorMsg + "\n";
                    errorMsg += "Error Code: 002\nSystem Message: " + err.message;
                    alert(errorMsg);
                    errorMsg = "";
                } else {
                    alert("There was a problem loading the requested page");
                    return;
                }
            }

            if (errorMsg) {
                try{
                    showPopup("#divError");
                } catch (err) {
                    if (debugMode) {
                        if (errorMsg) errorMsg = "App Message: " + errorMsg + "\n";
                        errorMsg += "Error Code: 003\nSystem Message: " + err.message;
                        alert(errorMsg);
                        errorMsg = "";
                    } else {
                        alert("There was a problem loading the requested page");
                        return;
                    }
                }
            }
        }
    }

    postParms = getParms(parms);

    //xmlhttp.open("POST", "http://localhost/ares/Services.aspx", true);
    //xmlhttp.open("POST", "http://192.168.2.6/ares/Services.aspx", true);
    xmlhttp.open("POST", "http://mobile.thevoicelibrary.net/Services.aspx", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(postParms);
}

function loadComplete(e) {

    //$.getScript("js/jquery.mobile-1.4.3.js");
    //hidePopup("#divBusyMsg");
    //if (e.errorMsg) {
    //    showPopup("#divError");
    //}
}

function getParms(parms) {

    var fieldParms = "";

    if (parms) {
        fieldParms += "&" + parms
    }

    for (var frm = 0; frm < document.forms.length; frm++) {
        for (var node = 0; node < document.forms[frm].length; node++) {
            switch (document.forms[frm][node].type) {
                case "radio":
                    if (document.forms[frm][node].checked) {
                        fieldParms += "&" + document.forms[frm][node].name + "=" + document.forms[frm][node].value;
                    }
                    break;
                case "button":
                    break;
                default:
                    fieldParms += "&" + document.forms[frm][node].name + "=" + document.forms[frm][node].value;
                    break;
            }
        }
    }

    return fieldParms;
}

function toggleUserLabel() {

    var lblUsername = document.getElementById("lblUsername");

    if (lblUsername.innerHTML == "Username: ") {
        lblUsername.innerHTML = "Listener ID: ";
    } else {
        lblUsername.innerHTML = "Username: ";
    }
}

function newNav(strHREF) {
	window.open(strHREF, "_blank","toolbar=yes, location=yes, directories=yes, status=yes, menubar=yes, scrollbars=yes, resizable=yes, copyhistory=no", true);
}

function redirect(strHREF){
    window.location = strHREF;
}

function formatEmail(username, domain) {
    document.write("<a href=" + '"mailto:' + username + "@" + domain + '"' + ">" + username + "@" + domain + "</a>");
}

function setContentHeight(height) {

    var divContent = document.getElementById("content");

    height += "px";
    divContent.style.height = height;
}

function setCurrentMenu(menu_id) {

    var menu = document.getElementById(menu_id);

    if (menu) {
        menu.className = "current";
    }
}