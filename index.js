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
				init();
			}
		};

		document.getElementsByTagName("head")[0].appendChild(script);
	} else {
		init();
	}

  function loadAdServers() {
    return new Promise((resolve, reject) => {
      return $.ajax({
        method: 'GET',
        url: 'https://afternoon-reef-17770.herokuapp.com/',
        success: (data) => resolve(JSON.parse(data)),
        error: (err) => reject(err),
      });
    });
  }

  function populateAdOject(adServers) {
    const aTags = $('a');

    console.log('Searching for ads...');
    for (let i = 0; i < aTags.length; i++) {
      for (let j = 0; j < adServers.length; j++) {
        const aLink = $(aTags[i]).attr('href');
  
        if (typeof aLink === 'string' && aLink.includes(adServers[j]) && $(aTags[i]).is(":visible")) {
          console.log('Ad found!');
          const a = $(aTags[i]);
          const img = $(a.children('img')['context']);
          
          if (img) {
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
    }
  }

  function init() {
    loadAdServers()
    .then((adServers) => {
      populateAdOject(adServers);
      console.log('Completed search for ads.');
      console.log(JSON.stringify(adObj, null, '  '));
    })
    .catch((err) => console.error('Error: ' + err));
  }
})()