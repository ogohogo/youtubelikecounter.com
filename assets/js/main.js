var YT = {};
var APIUrl = "https://livecounts.io"
var video;
var loaded;

YT.updateManager = {
    updateViews: (a) => {
        document.querySelector(".views").innerHTML = a;
    },
    updateLikes: (a) => {
        document.querySelector(".likes").innerHTML = a;
    },
    updateDislikes: (a) => {
        document.querySelector(".dislikes").innerHTML = a;
    },
    updateComments: (a) => {
        document.querySelector(".comments").innerHTML = a;
    },
    updateTitle: (a) => {
        document.querySelectorAll(".title").forEach(t => {
            t.innerHTML = a;
        })

        document.querySelector(".videoDetails").classList.remove("hidden")
    },
    updateDescription: (a) => {
        document.querySelector(".description").innerHTML = a;
    },

    updateYear: (a) => {
        document.querySelector(".year").innerHTML = a;
    },

    updateURL: (a) => {
        if (location.href.endsWith("/")) history.pushState(null, null, `#!/${a}`);
        else history.pushState(null, null, `/#!/${a}`);
    },

    updateTwitterURL: (a) => {
        document.querySelector(".shareTwitter").href = a
    }
}

YT.systemManager = {
    getEstimatedViewCount: (a, b, c) => {
        var videoId = a;
        var views = parseInt(b);
        var likes = parseInt(c);

        var localLikeCount = parseInt(localStorage.getItem('likeCount-' + videoId))
        var localViewCount = parseInt(localStorage.getItem('viewCount-' + videoId))
        var ratio = views / likes;
        if (!localViewCount) {
            localStorage.setItem('likeCount-' + videoId, parseInt(likes));
            localStorage.setItem('viewCount-' + videoId, parseInt(views));
        }
        if (localViewCount != views) {
            localStorage.setItem('viewCount-' + videoId, parseInt(views));
            localStorage.setItem('likeCount-' + videoId, parseInt(likes));
            return views;
        }
        var estViewCount = Math.round(views + (likes - localLikeCount) * ratio);
        return estViewCount;
    },

    getVideoInURL: () => {
        return window.location.href.split("#!/")[1]
    },

    loaderFadeOut: function () {
        document.querySelector("#loader-wrapper").classList.toggle('fade');
        setTimeout(() => {
            document.querySelector("#loader-wrapper").classList.add("hidden")
        }, 500)
    },

    loaderFadeIn: function () {
        document.querySelector("#loader-wrapper").classList.toggle('fade');
        document.querySelector("#loader-wrapper").classList.remove("hidden")
    }

}

YT.dataManager = {
    getData: async () => {
        if (!video) return;

        const data = await fetch(`${APIUrl}/api/live-view-count/data/${video}`).then(res => res.json())

        YT.updateManager.updateTitle(data.name)
        YT.updateManager.updateDescription(data.description)

        YT.updateManager.updateTwitterURL(`https://twitter.com/intent/tweet?url=&text=Watch%20${data.name}'s%20Live%20View%2C%20Like%2C%20Dislike%20and%20Comment%20count%20on%20https%3A%2F%2Fwww.youtubelikecounter.com%2F%23%2F${video}%20!`)
    },
    getStats: async () => {
        const data = await fetch(`${APIUrl}/api/live-view-count/stats/${video}`).then(res => res.json())

        YT.updateManager.updateViews(data.viewerCount && data.viewerCount || YT.systemManager.getEstimatedViewCount(video, data.followerCount, data.bottomOdos[0]))
        YT.updateManager.updateLikes(data.bottomOdos[0])
        YT.updateManager.updateDislikes(data.bottomOdos[1])
        YT.updateManager.updateComments(data.bottomOdos[2])
    }
}

YT.searchManager = {
    search: async (a) => {

        if (a.includes("youtube.com/watch?v=") || a.includes("youtu.be")) {
            video = a.split("/")[3].replace("watch?v=", "").split("&")[0]

            YT.systemManager.loaderFadeIn();
            YT.dataManager.getData();
            YT.dataManager.getStats();
            YT.updateManager.updateURL(video)

            document.querySelector(".afterVideoLoaded").classList.remove("hidden")
            return YT.systemManager.loaderFadeOut();
        }

        const data = await fetch(`${APIUrl}/api/live-view-count/search/${a}`).then(res => res.json());
        if (data.userData.length < 1) return alert("No Results Found!");

        video = data.userData[0].id

        YT.systemManager.loaderFadeIn();
        YT.dataManager.getData();
        YT.dataManager.getStats();
        YT.updateManager.updateURL(video)

        document.querySelector(".afterVideoLoaded").classList.remove("hidden")
        YT.systemManager.loaderFadeOut();
    }
}

setTimeout(() => {

    YT.updateManager.updateYear(new Date().getFullYear())

    if (window.location.href.includes("#!/")) {
        video = YT.systemManager.getVideoInURL()
        YT.dataManager.getData();
        YT.dataManager.getStats();

        document.querySelector(".afterVideoLoaded").classList.remove("hidden")
        return YT.systemManager.loaderFadeOut();
    } else {
        return YT.systemManager.loaderFadeOut();
    }

})

setInterval(() => {
    if (!video) return;

    YT.dataManager.getStats();
}, 3 * 1000)

document.querySelector(".searchInput").addEventListener("keyup", (event) => {
    if (event.keyCode != 13) return;

    let val = document.querySelector(".searchInput").value
    if (val < 1) return alert("Search Query can't be empty!")
    return YT.searchManager.search(val)
});

document.querySelector(".searchButton").onclick = () => {

    let val = document.querySelector(".searchInput").value;
    if (val < 1) return alert("Search Query can't be empty!");
    return YT.searchManager.search(val);

}

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());

gtag('config', 'UA-119417406-9');
