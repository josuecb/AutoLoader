# AutoLoader
This Javascript class will let you add your library for front-end only according to your folder tree.

To use this Autolaoder class you must create a config.json writting inside the library tree. 

Since javascript front-end doesn't let you to read the directory you must include the config.json file to load specific files you want.

# How to use it

## Create config.json
Lets suppose we have our javascript folder and this is the tree of our library:

```
| js -
      | src - 
             * lib1
             * libs2
      * Autoloader
      * main
```

So our config.json should be something like this:

```json
{
  "tree": {
    "js": {
      "": [
        "main"
      ],
      "src": [
        "lib1",
        "lib2"
      ]
    }
  }
}
```

You must put the key `tree` as parent root (only in the json file) and add the files that you want to import,
you can create as many config.son file as you want.

## Use the Autoloader class
```js
    var a = new AutoLoader("http://localhost/Autoloader/test/config.json", "/Autoloader/test");
    a.import(undefined, undefined, true);
```

The construction have 2 arguments:

- First argument: is the path of the json file (Remember to give the URI) since this is front end you must give the
URI.
- Second argument: is the path the extra path to detect your javascript root path.

#### For example
Our host is localhost lets supose our javascript library is in 'js' folder

```
| localhost -
             | js -
                   | folder
                   * class.js
                   * ...
```

our js folder is in main folder so our second argurment must be "/"

```
| localhost -
             | folder1 -
                        | folder2 -
                                   | js -
                                         | folder
                                         * class.js
                                         * ...
```                                         
Our js folder is in a sub direcotyr so our second argurment must be "/folder1/folder2/"
