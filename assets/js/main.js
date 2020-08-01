var YT = {};
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
    getData: function () {
        if (video != undefined) {
            $.getJSON(`https://api.youtubelikecounter.com/youtube/video/snippet,statistics,liveStreamingDetails/${video}`, function (data) {
                if (data.items.length < 1) YT.updateManager.updateTitle("Invalid Video ID! Try searching for video again!")

                if (data.items[0].liveStreamingDetails && data.items[0].liveStreamingDetails.concurrentViewers) YT.updateManager.updateViews(data.items[0].liveStreamingDetails.concurrentViewers)
                else YT.updateManager.updateViews(YT.systemManager.getEstimatedViewCount(data.items[0].id.channelId, data.items[0].statistics.viewCount, data.items[0].statistics.likeCount))

                YT.updateManager.updateLikes(data.items[0].statistics.likeCount)
                YT.updateManager.updateDislikes(data.items[0].statistics.dislikeCount)
                YT.updateManager.updateComments(data.items[0].statistics.commentCount)
                YT.updateManager.updateTitle(data.items[0].snippet.title)
                YT.updateManager.updateDescription(data.items[0].snippet.description)

                YT.shareButtonsManager.updateTwitter(`https://twitter.com/intent/tweet?url=&text=Watch%20${data.items[0].snippet.title}'s%20Live%20View%2C%20Like%2C%20Dislike%20and%20Comment%20count%20on%20https%3A%2F%2Fwww.youtubelikecounter.com%2F%23%2F${video}%20!`)
            })
        }
    }
}

YT.searchManager = {
    search: function (a) {
        if (a.includes("youtube.com/watch?v=")) {
            video = a.split("watch?v=")[1]

            YT.systemManager.loaderFadeIn();
            YT.dataManager.getData();

            if (location.href.endsWith("/")) history.pushState(null, null, `#/${video}`);
            else history.pushState(null, null, `/#/${video}`);

            setTimeout(function () {
                document.querySelector(".afterVideoLoaded").classList.remove("hidden")
                YT.systemManager.loaderFadeOut();
            }, 250)

        } else {
            $.getJSON(`https://api.youtubelikecounter.com/youtube/search/snippet/${a}/&type=video`, function (data) {
                if (data.items < 1) alert("No Results Found!")
                else {
                    video = data.items[0].id.videoId

                    YT.systemManager.loaderFadeIn();
                    YT.dataManager.getData();

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
        YT.dataManager.getData()
        setTimeout(function () {
            document.querySelector(".afterVideoLoaded").classList.remove("hidden")
            YT.systemManager.loaderFadeOut();
        }, 250)
    } else {
        YT.systemManager.loaderFadeOut();
    }
})

setInterval(function () {
    if (video != undefined) {
        YT.dataManager.getData()
    }
}, 2500)

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
