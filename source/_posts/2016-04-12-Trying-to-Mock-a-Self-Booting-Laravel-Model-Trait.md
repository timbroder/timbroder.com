---
author: tim
comments: true
date: 2016-04-12 11:01:00+00:00
layout: post
link: ''
slug: trying-to-mock-a-self-booting-laravel-model-trait
title: Trying to Mock a Self Booting Laravel Model Trait
categories:
- Code
tags:
- laravel
- TDD
- testing
- mock
---

[Bootable](http://www.archybold.com/blog/post/booting-eloquent-model-traits "Bootable") Model traits are pretty nifty. I'm using them to register certain events for the models using my Trait. However, I've run into an issue trying to mock models that are using the trait. Specifically, when a Mockery version of the model is instantiated, it's boot code agrees that it should have a bootMyTrait method, but can't find it when it tries to call it.

As an example, here is a trait:

```php
namespace App;
trait MyTrait
{
    public static function bootMyTrait()
    {
        print("Booting MyTrait\n");
    }
}
```
And a model using it:

```php
namespace App;
use Illuminate\Database\Eloquent\Model;
class MyModel extends Model
{
    use MyTrait;
}
```

Instantiating the model regularly works fine. This shows the desired output:

```php
$model = new MyModel();
```

However, trying to mock this model does not cooperate. This:

```php
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;


class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function testTraitBooting()
    {
        $model = $this->getMock('App\MyModel');
    }
}
```

Fails. Adding some debugging to Eloquent:

```php
    /**
     * Boot all of the bootable traits on the model.
     *
     * @return void
     */
    protected static function bootTraits()
    {
        $class = static::class;

        foreach (class_uses_recursive($class) as $trait) {
            print("\nTesting that class: $class has method: " . $method = 'boot'.class_basename($trait) . " because of Trait: $trait\n");
            if (method_exists($class, $method = 'boot'.class_basename($trait))) {
                print("Class: $class has method: $method \n");
                try {
                    forward_static_call([$class, $method]);
                } catch (\PHPUnit_Framework_MockObject_BadMethodCallException $e) {
                    print("Class: $class failed calling $method\n");
                    throw $e;
                }
            }
        }
    }
```

Gives us this failure:

```
PHPUnit 5.1.0 by Sebastian Bergmann and contributors.

E                                                                   1 / 1 (100%)
Testing that class: Mock_MyModel_9ee820db has method: bootMyTrait because of Trait: App\MyTrait
Class: Mock_MyModel_9ee820db has method: bootMyTrait
Class: Mock_MyModel_9ee820db failed calling bootMyTrait


Time: 129 ms, Memory: 18.00Mb

There was 1 error:

1) ExampleTest::testTraitBooting
PHPUnit_Framework_MockObject_BadMethodCallException:

mock-bootable-laravel-model-trait/vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php:326
mock-bootable-laravel-model-trait/vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php:309
mock-bootable-laravel-model-trait/vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php:296
mock-bootable-laravel-model-trait/vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php:277
mock-bootable-laravel-model-trait/tests/ExampleTest.php:16
```

I've also tried creating the mock a few different ways. Using [DatabaseSoftDeletingTraitTest](https://github.com/laravel/framework/blob/2a38acf7ee2882d831a3b9a1361a710e70ffa31e/tests/Database/DatabaseSoftDeletingTraitTest.php#L14 "DatabaseSoftDeletingTraitTest") as an example:

```php
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Mockery as m;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function testTraitBooting()
    {
        $mock = m::mock('App\MyModel');
        $mock->shouldReceive('bootMyTrait')->once();
    }
}
```

But here, bootMyTrait is never called:

```
PHPUnit 5.1.0 by Sebastian Bergmann and contributors.

E                                                                   1 / 1 (100%)

Time: 149 ms, Memory: 19.25Mb

There was 1 error:

1) ExampleTest::testTraitBooting
Mockery\Exception\InvalidCountException: Method bootMyTrait() from Mockery_0_App_MyModel should be called
 exactly 1 times but called 0 times.

mock-bootable-laravel-model-trait/vendor/mockery/mockery/library/Mockery/CountValidator/Exact.php:37
mock-bootable-laravel-model-trait/vendor/mockery/mockery/library/Mockery/Expectation.php:271
mock-bootable-laravel-model-trait/vendor/mockery/mockery/library/Mockery/ExpectationDirector.php:120
mock-bootable-laravel-model-trait/vendor/mockery/mockery/library/Mockery/Container.php:297
mock-bootable-laravel-model-trait/vendor/mockery/mockery/library/Mockery/Container.php:282
mock-bootable-laravel-model-trait/vendor/mockery/mockery/library/Mockery.php:142
mock-bootable-laravel-model-trait/vendor/laravel/framework/src/Illuminate/Foundation/Testing/TestCase.php:122
```

So, I can move the code I'm doing in the boot method to a ServiceProvider, but then I'll need to register each Model that uses the trait. This feels dirty, and using the boot method seems appropriate. So I think I've either hit a bug, or am Mocking the trait-using-model incorrectly. I've looked at ```getMockForTrait``` but I also need the mocked instance to extend Eloquent (a few of the trait's methods call eloquent methods)

If anyone sees something I missed, much appreciated