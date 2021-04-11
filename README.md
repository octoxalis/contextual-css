# Contextual-CSS


Semantic HTML driven Node JS script to create modular stylesheets:
+  no-dependancy
+  flat learning curve


## Howto

+  Take all (or part of) the HTML code of a web page
+  Remove (or comment out) all text nodes inside every tag
+  Remove (or comment out) all attributes except those needed to specify the CSS selector to generate
+  Insert the CSS declaration(s) relative to each tag
+  Save the file as an HTML file (.html extension)
+  Run the Node JS script to generate a CSS file (.css extension)


## The context function


### **url**
<hr/>


#### `context( url, relative_url )`

The file named by the argument `relative_url` will be put on the proceed stack to be processed after the current one.<br/>
This a useful function to be able to generate modular stylesheets.


### **stack**
<hr/>


#### `context( stack, stack_directive )`

To create every ruleset selector, Contextual-CSS uses a tag stack while processing all HTML tags in the file.<br/>
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


#### `context( copy )`

Nesting this function in any tag will group it with the following one.<br>
It can be used for different tags with identical declarations (for instance in a definition list).


### **minify**
<hr/>


#### `context( minify, boolean )`

All following rulesets will be minified if `boolean` is `true` (or `TRUE`) and<br/>
not minified if it's `false` (or `FALSE`).


## Classes

Contextual-CSS has been designed primarily a classless stylesheet utility: selectors are driven by the HTML hierarchy.

However, sometimes defining classes can be helpful and it can been done the following way:<br/>
+  to declare any tag as a class, add the usual attribute/value pair `class="className"` in the opening __and   closing tag__ (Contextual-CSS has not to be a valid HTML file).


## Examples

A simple demo of [Contextual-CSS][1]



[1]: https://github.com/octoxalis/contextual-css/blob/master/examples/tutorial/index.html