var linkData = [];
var useExternalSource = false;
function getCountryFlagURL(country) {
    var url = "https://restcountries.com/v3.1/name/" + country;
    var dt = '';
    $.ajax({
        url: url,
        async: false,
        dataType: 'json',
        success: function (data) {
            dt = data[0].flags.svg.replace("flagcdn.com", "raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags");
        }
    });
    return dt;
}

function process() {
    var url = 'https://raw.githubusercontent.com/TekMonts/TVWC/main/config.json';
    $.ajax({
        url: url,
        async: false,
        dataType: 'json',
        success: function (data) {
            useExternalSource = data.useExternalSource;
            linkData = data.linkData;
            processMatches(data.matchesData);
        },
        error: function (err) {
            alert("Có lỗi xảy ra khi khởi tạo TV!\nVui lòng thử lại sau!\n" + err);
        }
    });
}

function processLink() {
    linkData.forEach(lnk => {
        document.getElementById("selectChannel").innerHTML += "<option value='" + lnk.name + "'>" + lnk.name + "</option>";
    });
    var query = window.location.search.substring(1);
    var qs = parse_query_string(query);
    var cn = linkData[linkData.length - 1].name;
    if (qs.hasOwnProperty('channel')) {
        cn = qs.channel;
    }
    let obj = linkData.find(o => o.name === cn);
    document.title = 'Xem ' + obj.name + ' Full HD free by TekMonts!';
    var srcTV = obj.value;
    document.getElementById("selectChannel").value = obj.name;
    if (useExternalSource) { //Nếu là external source thì nhúng vào myIframe
        document.getElementById('myIframe').src = srcTV;
    } else { //Khởi tạo TVPlay bằng thư viện video-js
        document.getElementById('mainPlayer').innerHTML = "<center id='maintv'><video-js id='tvplay' class='vjs-default-skin' controls /></center>";
        var player = videojs('tvplay', {
            html5: {
                vhs: {
                    overrideNative: !videojs.browser.IS_SAFARI
                },
                nativeAudioTracks: false,
                nativeVideoTracks: false
            },
            autoplay: true,
            preload: "auto",
            muted: true,
            width: 640,
            height: 400
        });
        player.src({
            src: srcTV,
            type: 'application/x-mpegURL',
        });
        player.play();
    }

}

function processMatches(matches) {
    var mData = document.getElementById("mData");
    mData.innerHTML = "";
    matches.forEach(match => {
        var datetime = new Date(match.Date);
        var liveTime = new Date(datetime);
        var endTime = new Date(datetime);
		liveTime.setMinutes(datetime.getMinutes() - 15); //Hiện biểu tượng live trước 15'
        endTime.setHours(datetime.getHours() + 2); //Kết thúc sau 2 tiếng
        var times = ((datetime.getHours() < 10) ? "0" : "") + datetime.getHours() + ":" + ((datetime.getMinutes() < 10) ? "0" : "") + datetime.getMinutes();
        var dts = ((datetime.getDate() < 10) ? "0" : "") + datetime.getDate() + "/" + ((datetime.getMonth() < 9) ? "0" : "") + (datetime.getMonth() + 1) + "/" + datetime.getFullYear();
        var progress = "";
        var dtl = "";
        var matchInfo = "<div class='detail'>";
        var matchLive = "";
        var condition = false;
        if (new Date().getDate() == datetime.getDate()) {
            condition = true;
            if ((new Date() >= liveTime) && (new Date() <= endTime)) {
                matchLive = "<div class='stick stick-live'><i class='dot'></i>Live</div>";
            }
        }
        if ((new Date() >= endTime)) {
            dtl = "Kết thúc";
            progress = times;
            matchInfo = "<div class='time-loaded end'>";
        } else {
            progress = times;
            dtl = dts;
        }
        var htmls = "<div class='xitem xitem-grid'>";
        htmls += matchLive;
        htmls += "<div class='xitem-header'>";
        htmls += "<div class='xleague'>" + match.LeagueName + "</div>";
        htmls += "</div>";
        htmls += "<div class='xitem-main'>";
        htmls += "<div class='team team-home'>";
        htmls += "<div class='team-logo'>";
        htmls += "<img class='team-logo-img' loading='lazy' src='" + getCountryFlagURL(match.Home) + "'>";
        htmls += "</div>";
        htmls += "<div class='xname'>";
        htmls += "<h3 class='team-name'>" + match.Home + "</h3>";
        htmls += "</div>";
        htmls += "</div>";
        htmls += "<div class='xinfo'>";
        htmls += "<div class='status'>" + progress + "</div>";
        htmls += matchInfo + dtl + "</div>";
        htmls += "</div>";
        htmls += "<div class='team team-away'>";
        htmls += "<div class='team-logo'>";
        htmls += "<img class='team-logo-img' loading='lazy' src='" + getCountryFlagURL(match.Away) + "'>";
        htmls += "</div>";
        htmls += "<div class='xname'>"
        htmls += "<h3 class='team-name'>" + match.Away + "</h3>";
        htmls += "</div>";
        htmls += "</div>";
        htmls += "</div>";
        htmls += "</div>";
        if (condition) {
            mData.innerHTML = htmls + mData.innerHTML; //Cho lên trước
        } else {
            mData.innerHTML += htmls;
        }
    });
}

function parse_query_string(query) {
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        var key = decodeURIComponent(pair.shift());
        var value = decodeURIComponent(pair.join("="));
        if (typeof query_string[key] === "undefined") {
            query_string[key] = value;
        } else if (typeof query_string[key] === "string") {
            var arr = [query_string[key], value];
            query_string[key] = arr;
        } else {
            query_string[key].push(value);
        }
    }
    return query_string;
}

function redirect() {
    var optVal = $("#selectChannel option:selected").val();
    window.location.replace("?channel=" + optVal);
}

$(function () {
    var domain = window.location.hostname;
    if (!domain.includes("tekmonts")) {
        var answer = confirm("Bạn đang xem trên trang " + domain + "\nTrang web này copy từ trang https://tekmonts.github.io/TVWC\nBạn có muốn vào trang gốc?");
        if (answer) {
            window.location.replace("https://tekmonts.github.io/TVWC");
        } else {
            alert("Lần sau hãy vào trang gốc https://tekmonts.github.io/TVWC để xem bạn nhé!");
        }
    }
	process();
    setInterval(process, 60000);
    processLink();
});
