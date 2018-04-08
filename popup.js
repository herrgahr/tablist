/**
 * Copyright Thomas Gahr 2018
 * 
 * Distributed under the Apache License 2.0
 * See LICENSE.txt for details.
 * 
 * 
 * Show a list of all open tabs in the current window.
 * The list can be downloaded as an .html file.
 */
function init() {
  chrome.windows.getCurrent({populate: true}, function(currentWindow) {
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      var outputDiv = document.getElementById("tab-list");
      var titleDiv = document.getElementById("title");
      titleDiv.innerHTML = "<b>Tabs:</b>";
      
      var cnt = tabs.length;
      var activeTabId;
      const oneDown = function(){
        --cnt;
        if(!cnt) {
          enableDownload(tabs);
        }
      };

      tabs.forEach(function(tab) {
        if(tab.active) {
          activeTabId = tab.id;
        }
        displayTabInfo(tab.windowId, tab, outputDiv, oneDown);
      });      
    });
  });
}

function enableDownload(tabs) {
  var download = document.querySelector("#download");
  var outputDiv = document.getElementById("tab-list");
  var res = "<!doctype html>\n<html>\n";
  //add inline script to open all tabs
    res += "<head><script>\n"
    res += "function openAll() {\n";
    tabs.forEach(function(tab){
      res += "window.open('" + tab.url + "','_blank');\n";
    });
    res += "};\n";
    res += "</script></head>\n";
  res += "<body>\n";
  res += outputDiv.innerHTML;
  res += "<br><a href='javascript:openAll()'>Open all</a>\n";
  res += "</body>\n</html>\n\n";
  const utf8 = unescape(encodeURIComponent(res));
  var b64 = "data:application/octet-stream;charset=utf8;base64," + btoa(utf8);
  download.addEventListener('click', function(ev) {
    let now = new Date();
    let date = now.getFullYear() * 10000 + 
              (now.getMonth() + 1) * 100 + now.getDate();
    let filename = "tabs/tabs_" + date + ".html"
    chrome.downloads.download({
      "url": b64,
      "filename": filename
    }, function(){});
  }, false);
}

// Print a link to a given tab
function displayTabInfo(windowId, tab, outputDiv, done) {
  outputDiv.innerHTML +=
    "<b><a href='" + tab.url + "' target='_blank'>" +
    "<img id='timg" + tab.id + "' src='chrome://favicon/" + tab.url + "'>" + tab.title +
    "</a></b><br>\n";
  if(tab.favIconUrl == undefined) {
    done();
    return;
  }

  //get favIcon as data-url for embedding into .html
	var img = new Image();
	img.src = "chrome://favicon/" + tab.url;
	img.onload = function() {
    //most convenient way is via canvas. <3 toDataURL()
		var canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);
    
    var timg = outputDiv.querySelector("#timg" + tab.id)
    timg.src = canvas.toDataURL();
    done();
	}
}

document.addEventListener('DOMContentLoaded', init);
