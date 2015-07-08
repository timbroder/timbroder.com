---
author: tim
comments: true
date: 2007-08-04 22:48:00+00:00
dsq_thread_id: '121501700'
layout: post
linked_list_url: ''
slug: google-code-updates-google-developer
title: First Google Gadget
wordpress_id: 29
categories:
- Code
tags:
- calendar
- gadgets
- gdata
- HOWTO
---

After being inspired about Google Gadgets from the [Google Developer
Podcast](http://google-code-updates.blogspot.com/2007/07/google-developer-
podcast-episode-five.html) I came up with on that my old [crew
team](http://www.rpicrew.com) can use. We have a shared google calendar that
some of us use to keep track of races, meetings, etc. This gadget pulls and
formats it nicely for the google IG or desktop.  
  
[![Add to Google](http://buttons.googlesyndication.com/fusion/add.gif)](http:/
/fusion.google.com/add?moduleurl=http%3A//hosting.gmodules.com/ig/gadgets/file
/109141966999504040851/RPICrewSchedule.xml)  
  
Javascript code for the gadget:  

    
    
    <style type="text/css">
    div.exp{
    padding: 0;
    margin: 0;
    }
    div.loc{
    margin-left: 19px;
    }
    </style>
    <script type="text/javascript">
    <!--
    /**
    * Season info *
    * 0 Fall: Aug 26 - Nov 1
    * 1 Winter Training: Nov 2 - March 1
    * 2 Spring: March 2 - May 25
    * 3 Summer: May 26 - Aug 25
    **/
    
    /**
    * Callback function for the GData json-in-script call
    * Inserts the supplied list of events into a div of a pre-defined name
    *
    * @param {json} root is the JSON-formatted content from GData
    */
    function processRaces(root) {
    displayRaces(root.feed, 'races');
    }
    
    //meow
    function displayRaces(feed, divId){
    var now = new Date();
    var season = getSeason(now);
    var events = document.getElementById(divId);
    
    //clear "Loading..."
    if (events.childNodes.length > 0){
    events.removeChild(events.childNodes[0]);
    }
    
    //display season
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(getSeasonText(season)));
    events.appendChild(d);
    
    //loop races
    for (var i=0; i<feed.entry.length; i++){
    var entry = feed.entry[i];
    
    var d = getDate(entry['gd$when'][0].startTime);
    if(isCurrSeason(now, d)){
    var title = entry.title.$t;
    var desc = entry.content.$t;
    
    //set up image and clicking to expand
    var div = document.createElement('div');
    div.className = 'exp';
    var toggle = document.createElement('img');
    toggle.src= 'http://timothy.broder.googlepages.com/p.jpg';
    toggle.align = 'absmiddle';
    toggle.id = i;
    toggle.onclick = function() {toggleDiv(this); }
    div.appendChild(toggle);
    div.appendChild(document.createTextNode(' ' + d.getMonth() + "/" + d.getDay() + ' - '));
    
    // get the href to link to the event
    for(var j=0; j<entry['link'].length; j++){
    if (entry['link'][j]['type'] == 'text/html' && entry['link'][j]['rel'] == 'alternate'){
    var href = entry['link'][j]['href'];
    }
    }
    
    //we can link to the cal
    if (typeof href != 'undefined'){
    var link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.appendChild(document.createTextNode(title));
    div.appendChild(link);
    }
    else{ //shouldn't get here but just in case
    div.appendChild(document.createTextNode(title));
    }
    
    div.appendChild(document.createElement('br'));
    
    events.appendChild(div);
    
    var where = entry['gd$where'][0].valueString;
    var tDiv = document.createElement('div'); //div that will be hidden initially
    tDiv.id ='id' + i;
    tDiv.style['display'] = 'none';
    tDiv.className = 'loc';
    events.appendChild(tDiv);
    
    if(desc != null && desc != ""){ //we have a desc (should be the teams we're competing against)
    var dDiv = document.createElement('span');
    dDiv.appendChild(document.createTextNode(desc + " "));
    tDiv.appendChild(dDiv);
    }
    //the location field is populated (hidden at start)
    if(where != null && where != ""){ //we have a location
    var it = document.createElement('i');
    var map = document.createElement('a');
    map.target = '_blank';
    //link to location on google maps
    map.href = 'http://maps.google.com/maps?f=q&hl;=en&&q;=' + spaceLink(entry['gd$where'][0].valueString);
    map.appendChild(document.createTextNode(entry['gd$where'][0].valueString));
    it.appendChild(document.createTextNode(" ("));
    it.appendChild(map);
    it.appendChild(document.createTextNode(")"));
    tDiv.appendChild(it);
    }
    }
    }
    }
    
    //format the date a little
    function getDate(when){
    var data = when.split("-");
    return new Date(data[0], data[1], data[2]);
    }
    
    //return int representation of season
    function getSeason(d){
    var month = d.getMonth();
    var day = d.getDate();
    var year = d.getFullYear();
    
    var aug = new Date(year, 8, 25);
    var nov = new Date(year, 11, 1);
    var mar = new Date(year, 3, 1);
    var may = new Date(year, 5, 25);
    
    if(aug < d && d <= nov) return 0; //fall
    else if(mar < d && d <= may) return 2; //spring
    else if(may < d && d <= aug) return 3; //summer
    else return 1; //winter
    }
    
    //figure out the current season
    function isCurrSeason(now, d){
    currSeason = getSeason(now);
    season = getSeason(d);
    
    if(currSeason == season){ //same season yes
    if(now.getFullYear() == d.getFullYear()){ //same year also, match
    return true;
    }
    if(season == 1 && (d.getFullYear() == now.getFullYear()-1)){ //diff year, prob winter
    return true;
    }
    }
    return false;
    }
    
    //return text for season
    function getSeasonText(season){
    if(season == 0) return "Fall Season";
    if(season == 1) return "Winter Training";
    if(season == 2) return "Spring Season";
    if(season == 3) return "Summer Season";
    
    return "no season"; //really shouldn't get here
    }
    
    //if the div is hidden show it, if not, hide it
    function toggleDiv(where_id){
    var div = document.getElementById('id' + where_id.id);
    var img = document.getElementById(where_id.id);
    if(div != null){
    if(div.style.display != 'none'){
    div.style.display = 'none';
    img.src= 'http://timothy.broder.googlepages.com/p.jpg';
    
    }
    else{
    div.style.display = 'block';
    img.src= 'http://timothy.broder.googlepages.com/m.jpg';
    }
    }
    }
    
    //convert the location so it can be used in a link to google maps
    function spaceLink(name){
    return name.replace(' ', ',+');
    }
    
    //-->
    </script>
    
    <div id="races"><p>Loading...</p></div>
    <script type="text/javascript" src="http://www.google.com/calendar/feeds/rpicrew@gmail.com/public/full?alt=json-in-script&callback;=processRaces&orderby;=starttime&singleevents;=true&sortorder;=ascending&start-min;=2007-01-01T00:00:00"></script>
    

  
  
And the XML for the gadget  
  

    
    
    <?xml version="1.0" encoding="UTF-8"?>
    <Module>
    <ModulePrefs title="RPI Crew Schedule"
    title_url="http://gpowered.net"
    author="Tim Broder"
    height="150"
    width="250"
    author_email="timothy.broder@gmail.com"
    thumbnail="http://timothy.broder.googlepages.com/RPICrewScheduleThumb.jpg"
    description="RPI Crew Race Schedule, links to the RPICrew shared google calendar"
    author_photo="http://timothy.broder.googlepages.com/timothybrodersimpsons.png"
    author_location="NYC"
    author_affiliation="gPowered"
    author_link="http://www.gpowered.net"
    screenshot="http://timothy.broder.googlepages.com/RPICrewScheduleScreen.jpg"
    >
    <Require feature="dynamic-height"/>
    <Require feature="analytics"/>
    </ModulePrefs>
    <Content type="html"><![CDATA[
    
    
    <script>
    // Track this gadget using Google Analytics.
    _IG_Analytics("UA-793489-6", "/RPICrewScheduleG");
    </script>
    <style type="text/css">
    div.exp{
    padding: 0;
    margin: 0;
    }
    div.loc{
    margin-left: 19px;
    }
    </style>
    <script type="text/javascript">
    <!--
    /**
    * Season info *
    * 0 Fall: Aug 26 - Nov 1
    * 1 Winter Training: Nov 2 - March 1
    * 2 Spring: March 2 - May 25
    * 3 Summer: May 26 - Aug 25
    **/
    
    /**
    * Callback function for the GData json-in-script call
    * Inserts the supplied list of events into a div of a pre-defined name
    *
    * @param {json} root is the JSON-formatted content from GData
    */
    function processRaces(root) {
    displayRaces(root.feed, 'races');
    }
    
    //meow
    function displayRaces(feed, divId){
    var now = new Date();
    var season = getSeason(now);
    var events = document.getElementById(divId);
    
    //clear "Loading..."
    if (events.childNodes.length > 0){
    events.removeChild(events.childNodes[0]);
    }
    
    //display season
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(getSeasonText(season)));
    events.appendChild(d);
    
    //loop races
    for (var i=0; i<feed.entry.length; i++){
    var entry = feed.entry[i];
    
    var d = getDate(entry['gd$when'][0].startTime);
    if(isCurrSeason(now, d)){
    var title = entry.title.$t;
    var desc = entry.content.$t;
    
    //set up image and clicking to expand
    var div = document.createElement('div');
    div.className = 'exp';
    var toggle = document.createElement('img');
    toggle.src= 'http://timothy.broder.googlepages.com/p.jpg';
    toggle.align = 'absmiddle';
    toggle.id = i;
    toggle.onclick = function() {toggleDiv(this); }
    div.appendChild(toggle);
    div.appendChild(document.createTextNode(' ' + d.getMonth() + "/" + d.getDay() + ' - '));
    
    // get the href to link to the event
    for(var j=0; j<entry['link'].length; j++){
    if (entry['link'][j]['type'] == 'text/html' && entry['link'][j]['rel'] == 'alternate'){
    var href = entry['link'][j]['href'];
    }
    }
    
    //we can link to the cal
    if (typeof href != 'undefined'){
    var link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.appendChild(document.createTextNode(title));
    div.appendChild(link);
    }
    else{ //shouldn't get here but just in case
    div.appendChild(document.createTextNode(title));
    }
    
    div.appendChild(document.createElement('br'));
    
    events.appendChild(div);
    
    var where = entry['gd$where'][0].valueString;
    var tDiv = document.createElement('div'); //div that will be hidden initially
    tDiv.id ='id' + i;
    tDiv.style['display'] = 'none';
    tDiv.className = 'loc';
    events.appendChild(tDiv);
    
    if(desc != null && desc != ""){ //we have a desc (should be the teams we're competing against)
    var dDiv = document.createElement('span');
    dDiv.appendChild(document.createTextNode(desc + " "));
    tDiv.appendChild(dDiv);
    }
    //the location field is populated (hidden at start)
    if(where != null && where != ""){ //we have a location
    var it = document.createElement('i');
    var map = document.createElement('a');
    map.target = '_blank';
    //link to location on google maps
    map.href = 'http://maps.google.com/maps?f=q&hl;=en&&q;=' + spaceLink(entry['gd$where'][0].valueString);
    map.appendChild(document.createTextNode(entry['gd$where'][0].valueString));
    it.appendChild(document.createTextNode(" ("));
    it.appendChild(map);
    it.appendChild(document.createTextNode(")"));
    tDiv.appendChild(it);
    }
    }
    }
    }
    
    //format the date a little
    function getDate(when){
    var data = when.split("-");
    return new Date(data[0], data[1], data[2]);
    }
    
    //return int representation of season
    function getSeason(d){
    var month = d.getMonth();
    var day = d.getDate();
    var year = d.getFullYear();
    
    var aug = new Date(year, 8, 25);
    var nov = new Date(year, 11, 1);
    var mar = new Date(year, 3, 1);
    var may = new Date(year, 5, 25);
    
    if(aug < d && d <= nov) return 0; //fall
    else if(mar < d && d <= may) return 2; //spring
    else if(may < d && d <= aug) return 3; //summer
    else return 1; //winter
    }
    
    //figure out the current season
    function isCurrSeason(now, d){
    currSeason = getSeason(now);
    season = getSeason(d);
    
    if(currSeason == season){ //same season yes
    if(now.getFullYear() == d.getFullYear()){ //same year also, match
    return true;
    }
    if(season == 1 && (d.getFullYear() == now.getFullYear()-1)){ //diff year, prob winter
    return true;
    }
    }
    return false;
    }
    
    //return text for season
    function getSeasonText(season){
    if(season == 0) return "Fall Season";
    if(season == 1) return "Winter Training";
    if(season == 2) return "Spring Season";
    if(season == 3) return "Summer Season";
    
    return "no season"; //really shouldn't get here
    }
    
    //if the div is hidden show it, if not, hide it
    function toggleDiv(where_id){
    var div = document.getElementById('id' + where_id.id);
    var img = document.getElementById(where_id.id);
    if(div != null){
    if(div.style.display != 'none'){
    div.style.display = 'none';
    img.src= 'http://timothy.broder.googlepages.com/p.jpg';
    
    }
    else{
    div.style.display = 'block';
    img.src= 'http://timothy.broder.googlepages.com/m.jpg';
    }
    }
    }
    
    //convert the location so it can be used in a link to google maps
    function spaceLink(name){
    return name.replace(' ', ',+');
    }
    
    //-->
    </script>
    
    <div id="races"><p>Loading...</p></div>
    <script type="text/javascript" src="http://www.google.com/calendar/feeds/rpicrew@gmail.com/public/full?alt=json-in-script&callback;=processRaces&orderby;=starttime&singleevents;=true&sortorder;=ascending&start-min;=2007-01-01T00:00:00"></script>
    
    
    
    
    ]]></Content>
    </Module>
    
    

