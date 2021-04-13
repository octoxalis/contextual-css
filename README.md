# Contextual-CSS


A Node JS script to generate semantic HTML driven modular stylesheets:
+  only one dependency: `fs-extra`
+  incredibly flat learning curve
+  one command to rule them all: modularity requires!


## Use
```bash
cd path/to/tutorial/directory
tutorial $ node ../../source/contextual_css.js --h
Valid arguments:
        (1) [optional] input file path (default: html.context.html),
        (2) [optional] output directory path (default: ./)
        (3) [optional] --s (output to stdout)
        (4) [optional] --v (verbose)
```


## Recipe

+  Take all (or part of) the code of a web page (from DevTools, for instance)
+  Remove (or comment out) the `<head>` section and doctype declaration!!!
+  Remove (or comment out) all text nodes inside every tag
+  Remove (or comment out) all attributes, except those needed to specify the CSS selector to generate
+  Insert inside each tag the needed CSS declaration(s)
+  Save the file as an HTML file (with a `.context.html` extension)
+  Run `contextual_css.js` script to generate a CSS file (`.css` extension)


## Motivation

There are many, many ways to structure Cascadind stylesheets, but the most obvious solutions are not always the most practiced.

**Contextual-CSS** is one of these solutions at our fingertips: it simply uses the hierarchical structure of the HTML code to setup the rulesets declarations of the stylesheets to be generated.<br/>
With the help of a few directives to parameterize the processing (using a `context` function), a single command yied a fully functional set of stylesheets, broken in as many components as required by the HTML structure of the page or fragment.<br/>
Of course, if the HTML code is further modified, the relative **Contextual-CSS** file has to reflect the change.


## Tags and declarations

The skeleton of a **Contextual-CSS** file is a replica of its associated HTML page (or fragment): tags only, that will be filled with CSS declarations.

But tags are not enougth to capture all the nuances of a stylesheet that are desired. Some declarations are related to specific states of the DOM nodes and their tags have to reflect this state.<br/>
Therefore tags can not only be pure tags but also tags with selectors:
```html
<aside>
  <a>
        display: none;
  </a>
  <a:target><!-- variant -->
        display: grid;
        justify-items: center;
  </a>
</aside>
```
The `<!-- variant -->` comment denote that there are two states of the `aside > a` relation: the inactive state and the "targeted" state.

Most usual kinds of CSS selectors can be added to any tag: they have to follow the usual CSS selector syntax:
```html
<input[id^="I"]:checked/>
<label[for^="I"]:hover>
</label>
```

__Important__: **Self-closing tags have to be closed!**


## Descendant selectors
By default, the HTML nesting hierarchy is replicated using the immediate descendant selector: `>`
```html
<ul>
        display: flex;
  <li>
          color: red;
  </li>
<ul>
```
will generate the following stylesheet:
```html
ul {
  display: flex;
}

ul > li {
  color: red;
}
```
It's the basis of **Contextual-CSS** processing.


Nevertheless, other relations between HTML nodes are possible, as follow.

## Sibling selectors

To specify a general or adjacent sibling relation between to consecutive tags at the same nesting level, either a general selector (`~`) or adjacent selector (`+`) have to be inserted on a line of its own between two tags:
```html
<input/>
+
<label:hover>
        filter: brightness(1.5);
</label>
```

## The context function

There is only one processing function (at the moment) to organize the output of a **Contextual-CSS** file, whose name is: `context`!<br/>
It takes two arguments: a __name__ and a __parameter__.


### **url**
<hr/>


#### `context( url, relative_url )`

The file named by the parameter `relative_url` will be put on the proceed stack to be processed after the current one.<br/>
This a useful function to be able to generate modular stylesheets.


### **stack**
<hr/>


#### `context( stack, stack_directive )`

To create every ruleset selector, **Contextual-CSS** uses a tag stack while processing all HTML tags in the file.<br/>
This function modify the stack as follow:

+   **keep**

    The current stack is kept for all following tags to be processed.<br/>
    If there was a previous `ignore` stack directive, it will be removed.

+   **ignore**

    The current stack is ignored for all following tags to be processed.<br/>
    Therefore, all tags will be processed as standalone selectors.

+   **new**

    A new stack will be initialized for all following tags to be processed.<br/>
    The previous stack will be replaced by the new one.<br/>
    This directive has to be set between tags of the same nested level.


### **copy**
<hr/>


#### `context( copy, next )`

Nesting this function in any tag will group it with the following one.<br>
It can be used for different tags with identical declarations (for instance in a definition list).
The parameter `next` is optional.


### **minify**
<hr/>


#### `context( minify, boolean )`

All following rulesets will be minified if `boolean` is `true` (or `TRUE`) and<br/>
not minified if it's `false` (or `FALSE`).


### **comment**
<hr/>


#### `context( comment )`

All HTML comments (relative to tags: `<!-- comment -->`) are automatically removed from the generated `.css` file.

By default, all CSS comments (relative to declarations: `/* comment */`) are also removed, unless a context-comment directive has been set (and not commented out by an HTML comment), usually at the begining of the file.


## Classes

**Contextual-CSS** has been designed primarily a classless stylesheet utility: selectors are driven by the HTML hierarchy.

However, sometimes defining classes can be helpful and it can been done the following way
```html
<section class="example">
        color: blue;
</section class="example">
```

Note that it is mandatory to put the same attribute/value pair in the closing tag: __Contextual-CSS is not, and doesn't have to be, a valid HTML file__.


## File format

By convention, the **Contextual-CSS** file has a double extension: `.context.html` (even if the file format is not fully compliant with an HTML grammar). After processing, this extension is replaced by the usual `.css` one.<br/>
In the tutorial, the name of each file is the root tag of the file.

As to improve code reading, an 8-spaces indentation between the opening tag and its declarations is used.


## Examples

Load this [simple demo][1] of **Contextual-CSS** using the files in the examples tutorial directory and read the [tutorial][2].



[1]: https://github.com/octoxalis/contextual-css/blob/master/examples/tutorial/index.html
[2]: https://github.com/octoxalis/contextual-css/blob/master/examples/tutorial/tutorial.md