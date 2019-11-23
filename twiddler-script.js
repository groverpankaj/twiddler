const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//(Users Name set)
var visitor = 'simonsays';
streams.users[visitor] = [];

document.getElementById('user-name').innerHTML = '@' + visitor;


//HELPER FUNCTIONS


// Tweet time Object to Human readable time
const getTweetTime = function(currentTweet) {
  let timeNow = new Date();
  let tweetDate = currentTweet.created_at;
  let fullDate =  tweetDate.getDate()   +  " " +
      monthNames[tweetDate.getMonth()]  +  " " +
      tweetDate.getFullYear();

  let timeElapsed = (timeNow - currentTweet.created_at)/1000;

  if(timeElapsed < 1) {
    return  '1 sec ago';
  }

  if(timeElapsed < 60) {
    return Math.floor(timeElapsed) + ' sec ago';
  }

  if(timeElapsed < 3600) {
    return Math.floor(timeElapsed/60) + ' min ago';
  }

  if(timeElapsed < 86400) {
    return Math.floor(timeElapsed/3600) + ' hr ago';
  } else {
    return (tweetDate.getDate()   +  " " + 
      monthNames[tweetDate.getMonth()]  +  " " +
      tweetDate.getFullYear());
  }      

}; //END function 

//Adds <span> tag on Hastag
const highLightHastag = function(input) {
  let currPosition;
  let slicedInput = input;
  let output;

  if(slicedInput.indexOf("#") === -1) {
    output = input; //No Hastags in message
  } else {
    output = '';
  }
  
  while(slicedInput.indexOf("#") !== -1) {
    currPosition =  slicedInput.indexOf("#");
    
    // Split from '#'
    output += slicedInput.slice(0, currPosition);
    slicedInput = slicedInput.slice(currPosition);

    //Add Opening Span
    output += '<span class="hastag">';

    // find ' ' i.e. where the word ends
    currPosition =  slicedInput.indexOf(" ");
    if(currPosition !== -1) { 
      output += slicedInput.slice(0, currPosition);
      slicedInput = slicedInput.slice(currPosition); 
    } else {
      output += slicedInput; //has reached the end and not found space
      slicedInput = '';
    }

    //Add Closing Span
    output += '</span>';

  }; //END while

  return output;

}; //END function


// Display Tweet
const displayTweet = function(currentTweet) {

  //Each Tweet Box
  let sectionElem = document.createElement("section");
  sectionElem.className = "tweet-box";
  mainDivElem.insertBefore(sectionElem, mainDivElem.firstChild);

  //Handle Name and link
  let handleBox = document.createElement("a");
  handleBox.className = "handle-box";
  handleBox.href = homeURL + "?handle=" + currentTweet.user;
  let linkText = document.createTextNode("@" + currentTweet.user);
  handleBox.appendChild(linkText);
  sectionElem.appendChild(handleBox);

  // Tweet Time
  let timeBox = document.createElement("div");
  timeBox.className = "time-box";
  let timeText = document.createTextNode(getTweetTime(currentTweet));
  timeBox.appendChild(timeText);
  sectionElem.appendChild(timeBox);

  // clear Both
  let emptyBox = document.createElement("div");
  emptyBox.className = "group";
  sectionElem.appendChild(emptyBox);

  // Tweet Message
  let messageBox = document.createElement("article");
  let messageText = highLightHastag(currentTweet.message); 
  $(messageBox).html(messageText);
  sectionElem.appendChild(messageBox);

  handleLinkEvent();
}; //END function


//Adds <span> tag on Hastag
const hastagFinder = function(input) {
  let currPosition;
  let slicedInput = input;
  let output;

  if(slicedInput.indexOf("#") === -1) {
    return; //No Hastags in message
  } 
  
  while(slicedInput.indexOf("#") !== -1) {
    currPosition =  slicedInput.indexOf("#");
    
    // Discard before '#'
    slicedInput = slicedInput.slice(currPosition);

    // find ' ' i.e. where the word ends
    currPosition =  slicedInput.indexOf(" ");
    
    if(currPosition !== -1) { 
      hastag = slicedInput.slice(0, currPosition-1);
      slicedInput = slicedInput.slice(currPosition); 
    } else {
      hastag = slicedInput; //has reached the end and not found space
      slicedInput = '';
    }

    hastagTrender[hastag] = (hastagTrender[hastag] || 0 ) + 1;

  }; //END while

}; //END function

// Display the sorted Hastag Array
const hastagCounterDisplay = function(sortedHastag) {
  trendsElem.innerHTML = ''; // Clear Previous trends

  for(let i = 0; i < sortedHastag.length; i++) {
  let eachTrendElem = document.createElement('section');
  eachTrendElem.className = 'trend-section';
  trendsElem.appendChild(eachTrendElem);

  let trendNameElem = document.createElement('div');
  trendNameElem.className = 'trend-name';
  let trendName = document.createTextNode(sortedHastag[i][0]);
  trendNameElem.appendChild(trendName);
  eachTrendElem.appendChild(trendNameElem);

  let trendCountElem = document.createElement('div');
  trendCountElem.className = 'trend-count';
  let trendCount = document.createTextNode(sortedHastag[i][1].toString() + ' Tweets');
  trendCountElem.appendChild(trendCount);
  eachTrendElem.appendChild(trendCountElem);
};



}

const hastagCounter = function() {
    dataObject = streams.home;  //All Tweets

  // mainDivElem.innerHTML = ''; // Clear Previous tweets

  hastagTrender = {}; //Empty it

  //start from zero to display correct time
  for(let i = 0; i <  dataObject.length; i++) { 
    hastagFinder(dataObject[i].message);
  }

  //Sorting object by converting to array
  let sortedHastag = [];
  for (var currKey in hastagTrender) {
      sortedHastag.push([currKey, hastagTrender[currKey]]);
  }
  sortedHastag.sort(function(a, b) {
      return b[1] - a[1];
  });

  // console.log(sortedHastag);
  hastagCounterDisplay(sortedHastag);
}


// Refresh the Tweet 
const refreshTweet = function() {

  if(handle === undefined) {
    dataObject = streams.home;
  } else {
    dataObject = streams.users[handle];
  }

  mainDivElem.innerHTML = ''; // Clear Previous tweets

  //start from zero to display correct time
  for(let i = 0; i <  dataObject.length; i++) { 
    displayTweet(dataObject[i]);
  }

  hastagCounter();

};  // END function


// Change the URL Parameters and then refresh tweet
const changeURLParams = function() {
  if (history.pushState) {
    
    if(handle !== undefined) {
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?handle=' + handle;
    } else {
      var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    } // END if(handle !== undefined)

    window.history.pushState({path:newurl},'',newurl); 
    
    directionTextChange(); // Not Part of URL Change
    refreshTweet(); // Not Part of URL Change
  }; // END if(history)
}; //END function


// Add event listner to Handle anchor tag 
const handleLinkEvent = function() {
  let handleElem = document.getElementsByClassName('handle-box');
  
  for(let i = 0; i < handleElem.length; i++) {
    
    handleElem[i].addEventListener("click", function(eve) {
      eve.preventDefault();
      let pos = eve.target.href.indexOf("?handle=");
      handle = eve.target.href.slice(pos+8);
      changeURLParams();
    });
  
  }; //END for

}; // END function


//Direction Bar Matter
const directionTextChange = function() {

if(handle === undefined) {
    homeBackElem.innerHTML = 'Home';
    homeBackElem.style.fontSize = "1.4em";
    homeBackElem.style.paddingTop = "14px"; 
    
    handleTopNameElem.innerHTML = '';
  } else {
    homeBackElem.innerHTML = '&larr;';
    homeBackElem.style.fontSize = "2.0em";
    homeBackElem.style.paddingTop = "10px";

    handleTopNameElem.href = homeURL + "?handle=" + handle;
    handleTopNameElem.innerHTML = '@' + handle;
  }

  if( (handle === visitor) || (handle === undefined) ) {
    $('#new-tweet').css('display', 'inherit');
  } else {
    $('#new-tweet').css('display', 'none')
  }

}; // END function

// Home / Back Button on Top of Tweet Box
const homeBackButton = function() {
  
  directionTextChange();

  //Add event listener
  homeBackElem.addEventListener("click", function(eve) {
    eve.preventDefault();

    if(eve.target.innerHTML.toLowerCase() !== 'home') {
      handle = undefined;
      changeURLParams();
    };
  });

}; //END function


//Add Users new tweet
const addUsersTweet = function() {
  let usersTweetElem = document.getElementById('user-tweet');
  let usersTweet = usersTweetElem.value;
  if(usersTweet !== '') {
    writeTweet(usersTweet); // in data_generator.js
    usersTweetElem.value = '';
    refreshTweet();
  }
}; // END function


// Friend List
const addFriendList = function() {
  
  let friendList = [];
  for(let currKey in streams.users) {
    if(currKey !== visitor) {
      friendList.push(currKey);
    }
  } // END FOR
  // console.log(friendList);

  var friendListElem = document.getElementById('friend-div');

  for(let i = 0; i < friendList.length; i++) {
    let friendElem = document.createElement('a');
    friendElem.className="group";
    friendElem.href = homeURL + "?handle=" + friendList[i];
    friendElem.innerHTML = '@' + friendList[i];

    //Add Event Listener
    friendElem.addEventListener("click", function(eve) {
      eve.preventDefault();
      let pos = eve.target.href.indexOf("?handle=");
      handle = eve.target.href.slice(pos+8);
      changeURLParams();
    });

    friendListElem.appendChild(friendElem);
  } //END for  

}; //END finction


// Scroll Bar when window height is smaller than div height
const navBarScroll = function(){

  let windowHeight = $(window).height();

  if(windowHeight < navDivHeight) {
    $("#left-div").css("overflow-y", "scroll");
    $("#left-div").css("height", "100%");
  } else {
    $("#left-div").css("overflow-y", "inherit");
    $("#left-div").css("height", "inherit");
  }

}; // END function navBarScroll



// URL & Handle Section
const currentURL = window.location.href; 
let indexHandle = currentURL.indexOf("?handle=");
let handle;
let homeURL;

if(indexHandle !== -1) {
  handle = currentURL.slice(indexHandle+8);
  homeURL = currentURL.slice(0, indexHandle);
} else {
  homeURL = currentURL;
}

const allHandles = []; 
for(let currKey in streams.users) {
  allHandles.push(currKey);
} 

if(!(allHandles.includes(handle))) {
  handle = undefined;    //check if URL Parameter matches any of the Users
}
// console.log('handle', handle);


//Declare Global Variables

//Main Tweet Box 
var mainDivElem = document.getElementById("tweet-div");

//Handle Top Name Display
var handleTopNameElem = document.getElementById("handleTopName");
handleTopNameElem.addEventListener("click", function(eve) {
  eve.preventDefault();
  let pos = eve.target.href.indexOf("?handle=");
  handle = eve.target.href.slice(pos+8);
  changeURLParams();
});

//Home Back Button
var homeBackElem = document.getElementById("homeback");
homeBackButton();

//Trends Section
var trendsElem = document.getElementById("trends");


var hastagTrender = {}; 


// Navigation  Scroll Bar Section
let navDivHeight = $("#left-div").height();
$(window).on('resize', navBarScroll);  //Nav Bar scroll 
navBarScroll();   //initial


changeURLParams(); // Initial to correct URL is it is incorrect
// console.log(streams);


addFriendList();


let refreshCounter = 0;
var refreshTweetFeed = function(){
  refreshTweet();
  refreshCounter++;
  if(refreshCounter <= 3) {
    setTimeout(refreshTweetFeed, Math.random() * 5000);
  }
};
refreshTweetFeed();