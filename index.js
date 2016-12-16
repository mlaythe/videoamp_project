javascript:(function(){
  const adObj = {};
  const version = "1.3.2";

  adObj["location"] = window.location.href;
  adObj["advertisements"] = [];

  if (window.jQuery === undefined || window.jQuery.fn.jquery < version) {
    const script = document.createElement("script");
		let done = false;

		script.src = "https://ajax.googleapis.com/ajax/libs/jquery/" + version + "/jquery.min.js";
		script.onload = script.onreadystatechange = function(){
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				initMyBookmarklet();
			}
		};

		document.getElementsByTagName("head")[0].appendChild(script);
	} else {
		initMyBookmarklet();
	}

  function initMyBookmarklet() {
    const aTags = $('a');

    for (let i = 0; i < aTags.length; i++) {
      for (let j = 0; j < adServers.length; j++) {
        if (aTags[i].contains(adServers[i]) && aTags[i].is(":visible")) {
          const a = aTags[i];
          const img = a.children('img');
          const height = img.height();
          const width = img.width();
          const position = img.position();
          const adData = {
            height,
            width,
            position,
          };

          adObj["advertisements"].push(adData);
        }
      }
    }

    console.log(JSON.stringify(adObj, null, '  '));
  }
})()