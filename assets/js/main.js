var YT = {};
var APIUrl = "https://livecounts.io"
var video;
var loaded;

YT.updateManager = {
    updateViews: function (a) {
        document.querySelector(".views").innerHTML = a;
    },
    updateLikes: function (a) {
        document.querySelector(".likes").innerHTML = a;
    },
    updateDislikes: function (a) {
        document.querySelector(".dislikes").innerHTML = a;
    },
    updateComments: function (a) {
        document.querySelector(".comments").innerHTML = a;
    },
    updateTitle: function (a) {
        document.querySelectorAll(".title").forEach(t => {
            t.innerHTML = a;
        })
    },
    updateDescription: function (a) {
        document.querySelector(".description").innerHTML = a;
    }
}

YT.shareButtonsManager = {
    updateTwitter: function(a) {
        document.querySelector(".shareTwitter").href = a
    }
}

YT.systemManager = {
    getEstimatedViewCount: function (a, b, c) {
        var channelId = a;
        var views = parseInt(b);
        var likes = parseInt(c);

        var localLikeCount = parseInt(localStorage.getItem('likeCount-' + channelId))
        var localViewCount = parseInt(localStorage.getItem('viewCount-' + channelId))
        var ratio = views / likes;
        if (!localViewCount) {
            localStorage.setItem('likeCount-' + channelId, parseInt(likes));
            localStorage.setItem('viewCount-' + channelId, parseInt(views));
        }
        if (localViewCount != views) {
            localStorage.setItem('viewCount-' + channelId, parseInt(views));
            localStorage.setItem('likeCount-' + channelId, parseInt(likes));
            return views;
        }
        var estViewCount = Math.round(views + (likes - localLikeCount) * ratio);
        return estViewCount;
    },

    getVideoInURL: function () {
        return window.location.href.split("#/")[1]
    },

    loaderFadeOut: function () {
        $("#loader-wrapper").fadeOut();
    },

    loaderFadeIn: function () {
        $("#loader-wrapper").fadeIn(100);
    }

}

YT.dataManager = {
    getData: () => {
        if (video == undefined) return;

        $.getJSON(`${APIUrl}/api/live-view-count/data/${video}`, function (data) {
            YT.updateManager.updateTitle(data.name)
            YT.updateManager.updateDescription(data.description)

            YT.shareButtonsManager.updateTwitter(`https://twitter.com/intent/tweet?url=&text=Watch%20${data.name}'s%20Live%20View%2C%20Like%2C%20Dislike%20and%20Comment%20count%20on%20https%3A%2F%2Fwww.youtubelikecounter.com%2F%23%2F${video}%20!`)
        })
    },
    getStats: () => {
        $.getJSON(`${APIUrl}/api/live-view-count/stats/${video}`, function (data) {
            if (data.viewerCount != null) YT.updateManager.updateViews(data.viewerCount)
            else YT.updateManager.updateViews(YT.systemManager.getEstimatedViewCount(video, data.followerCount, data.bottomOdos[0]))

            YT.updateManager.updateLikes(data.bottomOdos[0])
            YT.updateManager.updateDislikes(data.bottomOdos[1])
            YT.updateManager.updateComments(data.bottomOdos[2])   
        })
    }
}

YT.searchManager = {
    search: function (a) {
        if (a.includes("youtube.com/watch?v=")) {
            video = a.split("watch?v=")[1]

            YT.systemManager.loaderFadeIn();
            YT.dataManager.getData();
            YT.dataManager.getStats();

            if (location.href.endsWith("/")) history.pushState(null, null, `#/${video}`);
            else history.pushState(null, null, `/#/${video}`);

            setTimeout(function () {
                document.querySelector(".afterVideoLoaded").classList.remove("hidden")
                YT.systemManager.loaderFadeOut();
            }, 250)

        } else {
            $.getJSON(`${APIUrl}/api/live-view-count/search/${a}`, function (data) {
                if (data.userData.length < 1) alert("No Results Found!")
                else {
                    video = data.userData[0].id

                    YT.systemManager.loaderFadeIn();
                    YT.dataManager.getData();
                    YT.dataManager.getStats();

                    if (location.href.endsWith("/")) history.pushState(null, null, `#/${video}`);
                    else history.pushState(null, null, `/#/${video}`);

                    setTimeout(function () {
                        document.querySelector(".afterVideoLoaded").classList.remove("hidden")
                        YT.systemManager.loaderFadeOut();
                    }, 250)
                }
            })
        }
    }
}

setTimeout(function () {

    
    if (window.location.href.includes("#/")) {
        video = YT.systemManager.getVideoInURL()
        YT.dataManager.getData();
        YT.dataManager.getStats();
        setTimeout(function () {
            document.querySelector(".afterVideoLoaded").classList.remove("hidden")
            YT.systemManager.loaderFadeOut();
        }, 250)
    } else {
        YT.systemManager.loaderFadeOut();
    }
})

setInterval(function () {
    if (video == undefined) return;

    YT.dataManager.getStats();
}, 3000)

document.querySelector(".searchInput").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        let val = document.querySelector(".searchInput").value
        if (val != 0) YT.searchManager.search(val)
    }
});

document.querySelector(".searchButton").onclick = function() {
    let val = document.querySelector(".searchInput").value
    if (val != 0) YT.searchManager.search(val) 
}

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-119417406-9');
