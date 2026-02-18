---
author: tim
comments: true
date: 2007-08-05 22:44:00+00:00
dsq_thread_id: '121758071'
layout: post
link: ''
slug: howto-displaying-blogger-feeds-with-php
title: 'HOWTO: Displaying Blogger feeds with PHP'
wordpress_id: 30
category: Code
tags:
- blogger
- gdata
- HOWTO
- php
---

This HOWTO is going to follow the basic structure of the
[Python](https://gpowered.net/g/post/2/) one.  
  
To start out you'll have to grab the [Zend Google data Client
Library](http://framework.zend.com/download/gdata) and then set the
include_path so you can use it  

```PHP
ini_set("include_path", ".:../:./include:../include:/home/gpowered/webapps/php/includes/ZendGdata-1.0.1/library");
```


We then import the parts the we'll need:  
  

    
```PHP 
require_once 'Zend/Loader.php';
Zend_Loader::loadClass('Zend_Gdata');
Zend_Loader::loadClass('Zend_Gdata_Query');
Zend_Loader::loadClass('Zend_Gdata_ClientLogin');
```

  
One of the first things we're going to have to do is authenticate with google
services. There are two ways to do this: [AuthSub proxy authentication](http://code.google.com/apis/blogger/developers_guide_php.html#auth_sub) which has a
user login using their own credentials, and [ ClientLogin username/password au
thentication](http://code.google.com/apis/blogger/developers_guide_php.html#client_login) where you send a username and password. We will be using
ClientLogin. I built a small class called gPoweredBlogger to hold the
different parts I will need for this example.  

```PHP
class gPoweredBlogger{
    private $user;// = 'timothy.broder';
    private $pass;// = '**************';
    private $service;// = 'blogger';

    private $blog_id;// = '413573351281770670';
    private $uri;// = "http://www.blogger.com/feeds/" . $blog_id . "/posts/default";
    private $show_num;// = 5;

    private $client;// = Zend_Gdata_ClientLogin::getHttpClient($user, $pass, $service);
    private $gdClient;// = new Zend_Gdata($client);
    private $query;// = new Zend_Gdata_Query($uri);

    private $total_posts;

    public $output;
```

Then we start setting up our call to the service.  
  

    
```PHP
public function __construct($user, $pass, $blog_id){
    $this->user = $user;
    $this->pass = $pass;
    $this->service = 'blogger';

    $this->blog_id = $blog_id;
    $this->uri = "http://www.blogger.com/feeds/" . $this->blog_id . "/posts/default";
    $this->show_num = 5;

    $this->client = Zend_Gdata_ClientLogin::getHttpClient($this->user, $this->pass, $this->service);
    $this->gdClient = new Zend_Gdata($this->client);
    $this->query = new Zend_Gdata_Query($this->uri);
    $this->total_posts = $this->get_total($this->query);
}
```

  
For more info see the [blogger developer's guide with
php](http://code.google.com/apis/blogger/developers_guide_php.html) or the
[Google Account Authentication
documentation](http://code.google.com/apis/accounts/Authentication.html)  
After we have authenticated with Google we need to start building up our query
to [GData](http://code.google.com/apis/gdata/). The first thing you'll need is
your blog's id.  
You can use the function in the dev guide to help you with this if you don't
already know it.  
Like the Python version, the below function returns the total number of posts
that are in the feed. We can get a small response by sending 0 for the max
results. Below is the function and the small response we get from it.  
  

    
```PHP
private function get_total($query){
    //query for no posts
    $this->query->setParam('max-results', '0');
    $this->query->setParam('start-index', '1');

    //get back entryless feed
    $feed = $this->gdClient->getFeed($this->query);
    return $feed->totalResults->text;
}
```




```XML
<ns0:feed xmlns:ns0="http://www.w3.org/2005/Atom">
<ns1:totalresults xmlns:ns1="http://a9.com/-/spec/opensearchrss/1.0/">5</ns1:totalresults>
<ns1:itemsperpage xmlns:ns1="http://a9.com/-/spec/opensearchrss/1.0/">0</ns1:itemsperpage>
<ns1:startindex xmlns:ns1="http://a9.com/-/spec/opensearchrss/1.0/">1</ns1:startindex>
<ns0:generator uri="http://www.blogger.com" version="7.00">Blogger</ns0:generator>
<ns0:author><ns0:name>Tim</ns0:name></ns0:author>
<ns0:id>tag:blogger.com,1999:blog-413573351281770670</ns0:id>
<ns0:link href="https://gpowered.blogspot.com/" rel="alternate" type="text/html" />
<ns0:link href="https://gpowered.blogspot.com/feeds/posts/default" rel="http://schemas.google.com/g/2005#feed" type="application/atom+xml" />
<ns0:link href="http://www.blogger.com/feeds/413573351281770670/posts/default?max-results=0" rel="self" type="application/atom+xml" />
<ns0:link href="http://www.blogger.com/feeds/413573351281770670/posts/default" rel="http://schemas.google.com/g/2005#post" type="application/atom+xml" />
<ns0:title type="text">gPowered</ns0:title>
<ns0:updated>2007-07-18T10:55:06.728-05:00</ns0:updated>
</ns0:feed>
```
    
    

  
So we get the total number of posts and then we can start pulling data. Lets
make a generic function, PostFrom, that can be used to show multiple posts, or
just single ones, depending on what you pass to it. The start number that is
passed to PostFrom has been set to the first post in the blog is considered to
have an id of 1 and the latest post is the same as total_posts. This is useful
so if viewers want to bookmark the page they are looking at, the post that is
being displayed will not change. The following are the different functions
that will make use of it.  
  

    
```PHP
//show latest posts
public function Posts(){
    return $this->ListPosts($this->total_posts);
}

//show posts starting from a certain point
public function ListPosts($start){
    $start = $this->total_posts - $start + 1;
    return $this->PostFrom($start, $this->show_num);
}

//show a single post
public function Post($start){
    $start = $this->total_posts - $start + 1;
    return PostFrom($start, 1);
}

//show count number of posts starting from a certain point
private function PostFrom($start, $count){
    //query for count number of posts starting at the given post
    $this->query->setParam('max-results', $count);
    $this->query->setParam('start-index', $start);
    $feed = $this->gdClient->getFeed($this->query);
```

  
Now we have all the data we need in the feed variable. Its been turned into an
object so we don't have to worry about XML parsing here. Every node has become
an objects and lists. Objects for single nodes(title), and lists for where
there are multiple nodes of the same name (entry, link)  
  

    
```PHP
//for links
$curr_id = $this->total_posts - $start + 1;

//normalize data for output
foreach($feed->entries as $entry){
    //id for links
    $entry->my_id = $curr_id;
    $curr_id -= 1;
}
```

  
Of course we're going to need next and previous buttons as well. The way we've
set up the math with total_posts and the start number, we only have to
increment or decrement these by count (the number of posts to display on a
page). I also set part of the link, as well as the page title, that I will use
below in the HTML.  
  

```PHP
$prev = $this->total_posts - ($start - $count) + 1;
if($prev > $total_posts){
    $prev = null;
}


$next = $this->total_posts - ($start + $count) + 1;
if($next < 1){
    $next = null;
}

//showing single post
if(count == 1){
    $link = 'post';
    $title = $feed->entries[0]->title->text;
    //listing posts
}
else{
    $link = 'posts';
    $title = 'home';
}
```

  
The final part is to make a quick object that we can use in the HTML to output
everything  

    
```PHP
        $this->output = new Output($feed->entries, $title, $prev, $next, $link);
    }
}

class Output{
    public $entries;
    public $title;
    public $prev;
    public $next;
    public $link;
    public function __construct($entries, $title, $prev, $next, $link){
        $this->entries=$entries;
        $this->title=$title;
        $this->prev=$prev;
        $this->next=$next;
        $this->link=$link;
    }
}
```

  
To the HTML!  
  
The first part consists of displaying the post itself, along with its relevant
information. So lets built up our objects  
  
```PHP
$blog = new gPoweredBlogger('timothy.broder', '*************', '413573351281770670');
$blog->Posts();

$output = $blog->output;
```

Below all the php we can run through out output object and display the posts  


```HTML
<? foreach($output->entries as $entry){ ?>
     <h2><a href="/post/<? echo $entry->my_id ?>"><? echo $entry->title->text ?></h2></a>
     <? echo $entry->content->text;
     $datetime = strtotime(substr($entry->published, 0, 10) . ' ' . substr($entry->published, 11, 8 ));
     ?>
     <p>Posted by <? echo $entry->author[0]->name->text ?> on <? echo date("m/d/Y",$datetime) ?> at <? echo date("g:i a",$datetime) ?></p>

      <div id="divider"></div>
      <?}?>
```

  
That's all for now. A working example is
[here](https://gpowered.net/php/blogger.php)

