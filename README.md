# Contextual-CSS


Semantic HTML driven Node JS script to create modular stylesheets:
+  no-dependancy
+  flat learning curve


## Use
```bash
cd path/to/context-file/directory
node relative/path/to/contextual_css.js html.context.html
```


## Howto

+  Take all (or part of) the HTML code of a web page
+  Remove (or comment out) all text nodes inside every tag
+  Remove (or comment out) all attributes except those needed to specify the CSS selector to generate
+  Insert the CSS declaration(s) relative to each tag
+  Save the file as an HTML file (.html extension)
+  Run the Node JS script to generate a CSS file (.css extension)


## Motivation

There are many, many ways to structure Cascadind stylesheets, but the most obvious solutions are not always the ones that are most practiced.

Contextual-CSS is one of these solutions at our fingertips: it simply uses the hierarchical structure of the HTML code to setup the rulesets declarations of the stylesheets we want to create.<br/>
With the help of a few directives to parameterize the processing, using a `context` function, a one Node JS command yied a fully functional set of stylesheets, broken in as many components as required by the CSS designer of the whole HTML structure of a Web page.


## Tags and declarations

The skeleton of a Contextual-CSS file is a replica of the its associated HTML page or fragment: tags only that are filled with the related CSS declarations.

But tags are not enougth to have all the nuances of a stylesheet that are desired. Some declarations are related to a specific state of a DOM node and its tag have to reflect this state.<br/>
Therefore tags can not only be tags but also selectors:
```html
<aside>
  <a>
        display: none;
  </a>
  <a:target>
        max-width: 50%;
        display: grid;
        justify-items: center;
        margin: 25vh auto;
        padding: 1rem;
        color: hsla(var(--hue_color) 50% 94%/1);
        font-size: 125%;
  </a>
</aside>
```

Most usual kinds of CSS selectors can be added to any tag: they have to follow the usual CSS selector syntax:
```html
<input[id^="I"]:checked/>
<label[for^="I"]:hover>
</label>
```

__Important__: **Self-closing tags have to be closed!**


## Sibling selectors

To specify a general or adjacent sibling relation between to consecutive tags at the same nesting level either a general selector (`~`) or adjacent selector (`+`) have to be inserted on a single line of its own between the two tags:
```html
<input/>
+
<label:hover>
        filter: brightness(1.5);
</label>
```



## The context function

There is only one processing function (at the moment) to organize the output of a Contextual-CSS file, whose name is: `context`!<br/>
It takes two arguments: a __name__ and a __parameter__.


### **url**
<hr/>


#### `context( url, relative_url )`

The file named by the parameter `relative_url` will be put on the proceed stack to be processed after the current one.<br/>
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


#### `context( copy, next )`

Nesting this function in any tag will group it with the following one.<br>
It can be used for different tags with identical declarations (for instance in a definition list).
The parameter `next` is optional.


### **minify**
<hr/>


#### `context( minify, boolean )`

All following rulesets will be minified if `boolean` is `true` (or `TRUE`) and<br/>
not minified if it's `false` (or `FALSE`).


## Classes

Contextual-CSS has been designed primarily a classless stylesheet utility: selectors are driven by the HTML hierarchy.

However, sometimes defining classes can be helpful and it can been done the following way:<br/>
+  to declare any tag as a class, add the usual attribute/value pair `class="className"` in the opening __and closing__ tags (Contextual-CSS has not to be a valid HTML file).


## File format

By convention, the Contextual-CSS file have a double extension: `.context.html` (even if the file format is not fully compliant with an HTML grammar, see lower). After processing, this extension is replaced by the usual `.css` one.<br/>
In the tutorial, the name of each file is the root tag of the file.

By convention, an 8-spaces indentation is used between the opening tag and its declarations, as to improve code reading.


## Examples

Load this [simple demo][1] of Contextual-CSS using the files in the examples tutorial directory.



[1]: https://github.com/octoxalis/contextual-css/blob/master/examples/tutorial/index.html