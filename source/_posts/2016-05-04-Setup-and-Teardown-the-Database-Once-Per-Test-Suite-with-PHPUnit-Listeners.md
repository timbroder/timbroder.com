---
author: tim
comments: true
date: 2016-05-04 16:15:00+00:00
layout: post
link: ''
slug: setup-and-teardown-the-database-once-per-test-suite-with-phpunit-listeners

title: Setup and Teardown the Database Once Per Test Suite with PHPUnit Listeners

categories:
- Code
tags:
- php
- laravel
- testing
- PHPUnit
---

I'm working on a series of integration tests where I want to set up and reset the database for each run. This could easily be done in the setUp and tearDown methods, but doing the full db each time is slow. Yes, I could just do the tables I need, but I was curious, and now I don't have to worry about which tables are setup in my testing DB. In this example, I'm using Laravel's migrations and SQLite as the test DB.

**UPDATE 05/05/2016**: As Sebastian [point out below](http://www.timbroder.com/2016/05/Setup-and-Teardown-the-Database-Once-Per-Test-Suite-with-PHPUnit-Listeners.html#comment-2659950789 "point out below") (thanks!) there is a much more appropriate way. Using ```setUpBeforeClass``` and ```tearDownAfterClass``` we achieve the same effect

```php
public static function setUpBeforeClass()
{
    parent::setUpBeforeClass();
    exec('php artisan migrate --database sqlite_test');
}

public static function tearDownAfterClass()
{
    exec('php artisan migrate:reset --database sqlite_test');
    parent::tearDownAfterClass(); 
}
```

<del>PHPUnit has [listeners](https://phpunit.de/manual/current/en/extending-phpunit.html#extending-phpunit.examples.SimpleTestListener.php "listeners") that you can tap into at various parts of your tests' lifecycle. I'm particularly interested in when a specific suite starts and ends. We'll need to do 2 things:</del>

1. <del>Create our Listener</del>
2. <del>Register this Listener in phpunit.xml</del>

The listener is as follows:

```php
class FullDBListener extends PHPUnit_Framework_BaseTestListener
{
    protected $suites = ['UserIntegrationTest', 'AccountIntegrationTest'];

    public function startTestSuite(PHPUnit_Framework_TestSuite $suite)
    {
        if (in_array($suite->getName(), $this->suites)) {
            exec('php artisan migrate --database sqlite_test');
        }
    }

    public function endTestSuite(PHPUnit_Framework_TestSuite $suite)
    {
        if (in_array($suite->getName(), $this->suites)) {
            exec('php artisan migrate:reset --database sqlite_test');
        }
    }
}
```

This does a few things:

1. <del>Stores the class names of each suite we want to run the db migrations for</del>
2. <del>In ```startTestSuite``` it checks to see if we're in the right suite</del>
3. <del>If we are, run an artisan migration on our test db</del>
4. <del>In ```endTestSuite``` it checks to see if we're in the right suite</del>
5. <del>If we are, run an artisan migration:reset on our test db</del>

<del>Next, we need to make PHPUnit aware of this listener. Update your path accordingly</del>

```xml
<listeners>
    <listener class="FullDBListener" file="./tests/app/FullDBListener.php"></listener>
</listeners>
```

That's it! 

I do do some basic teardown in my test suite's ```setUp``` method to give me a blank slate. This has proven faster then doing the migrations each time

```php
public function setUp()
{
    parent::setUp();

    User::truncate();
}
```

I hope this helped you, if you have any questions, let me know!