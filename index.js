javascript:(function() {
    const adObj = {};
    const version = "1.3.2";

    adObj.location = window.location.href;
    adObj.advertisements = [];

    //  if jQuery isn't a dependency or if the version is super old then start loading jQuery script
    if (window.jQuery === undefined || window.jQuery.fn.jquery < version) {
        const script = document.createElement("script");  
        let done = false;

        script.src = `https://ajax.googleapis.com/ajax/libs/jquery/${version}/jquery.min.js`;
        script.onload = script.onreadystatechange = function() {
            if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                done = true;
                init();
            }
        };

        document.getElementsByTagName("head")[0].appendChild(script);
    } else {
        init();
    }

    //  make GET to Heroku server that sends back array of known ad servers
    function loadAdServers() {
        return new Promise((resolve, reject) => {
            return $.ajax({
                method: "GET",
                url: "https://afternoon-reef-17770.herokuapp.com/",
                success: (data) => resolve(JSON.parse(data)),
                error: (err) => reject(err),
            });
        });
    }

    function loadFirebase() {
        $("body").append(`
            <script src="https://www.gstatic.com/firebasejs/3.6.4/firebase.js"></script>
            <script>
                // Initialize Firebase
                var config = {
                    apiKey: "AIzaSyDjZN_e1bdMetpBqoPJESgoLTC4Nfc7dW0",
                    authDomain: "videoamp-fd39e.firebaseapp.com",
                    databaseURL: "https://videoamp-fd39e.firebaseio.com",
                    storageBucket: "videoamp-fd39e.appspot.com",
                    messagingSenderId: "235186338274"
                };
                firebase.initializeApp(config);
            </script>
        `);
    }

    function persistData(adData) {
        //  Firebase doesn't allow certain special characters like: . # $ [ ] 
        //  Set Firebase reference to url, so ads will be separated by url in database
        const url = adObj.location.replace(/[.#$[\]/\\]/gi, "");
        const Ads = firebase.database().ref(`/ads/${url}`);
        const newAd = Ads.push();
        newAd.set(adData);
    }

    //  currently configured to work only with anchor and iframe tag
    function findAds(adServers, tag) {
        const elements = $(tag);

        for (let i = 0; i < elements.length; i += 1) {
            for (let j = 0; j < adServers.length; j += 1) {
                const el = $(elements[i]);
                const elLink = el.is("iframe") ? el.attr("src") : el.attr("href");

                // compares src or href against list of known ad servers
                if (typeof elLink === "string" && elLink.includes(adServers[j]) && el.is(":visible")) {
                    console.log("Found an ad!");
                    const img = $(el.children("img").context) || "";

                    if (img) {
                        const height = img.height();
                        const width = img.width();
                        const position = img.offset();
                        const adData = {
                            height,
                            width,
                            position,
                        };

                        persistData(adData);
                        adObj.advertisements.push(adData);
                    } else {
                        const height = el.height();
                        const width = el.width();
                        const position = el.offset();
                        const adData = {
                            height,
                            width,
                            position,
                        };

                        persistData(adData);
                        adObj.advertisements.push(adData);
                    }
                    continue;
                }
            }
        }
    }

    function populateAdObject(adServers) {
        console.log("Searching for ads...");
        findAds(adServers, "a");
        findAds(adServers, "iframe");
    }

    function init() {
        loadAdServers()
        .then((adServers) => {
            loadFirebase();
            populateAdObject(adServers);
            console.log("Completed search for ads.");
            console.log(JSON.stringify(adObj, null, "    "));
        })
        .catch((err) => console.error(`Error: ${err}`));
    }
})();
