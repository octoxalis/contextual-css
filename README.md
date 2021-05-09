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
    (1) [optional] input file path (default: html.context.html)
    (2) [optional] output directory path (default: ./)
    (3) [optional] --s (stdout output)
    (4) [optional] --u (unminify output)
    (5) [optional] --v (verbose)
    (5) [optional] --h (help)
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
  <!-- variant -->
  <a:target>
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


### No tag selectors

A universal selector (`*`) has no tag. Therefore, it can be simply set by a `<*>` and `</*>` pseudo-tag:
```html
<*>
        margin: 0;
        padding: 0;
        box-sizing: border-box;
</*>
```
This mechanism is extended to any pseudo-tag with a conditional selector, for instance:
```html
  <.simpleClass>
          top: 0;
  </.simpleClass>
  <:is(div, section) :is(em, i)>
          color: red;
  </:is>
```

In the second case, the closing pseudo-tag is shortened to its simplest form.<br>
__Of course it is valid if this `:is()` selector only pseudo-tag is placed at the root level (`html` tag) or after a `context( stack, ignore )` directive__.


### Block tag

A special `<block>` tag can be used to group common declarations shared by more than one ruleset.<br>
An _identifier_ have to be set, after the tag name. Each time the common block has to be inserted in a declaration block, the `context( block, _identifier_ )` is used.
```html
<block centered>
        display: grid;
        justify-items: center;
<block>
```
Somewhere else, after the previous block:
```css
<div>
  context( block, centered )
</div>
```

It can be useful to declare all blocks in a specific file, loaded from the Context-CSS root file or inside it, at the begining, to be able to use the blocks inside any other file.


## At-rules

Almost all currently defined CSS at-rules can be declared anywhere inside a Context-CSS: `@import`, `@media`, `@supports`, etc.
The declaration of these at-rules are "standardised" according to the pattern:
+ @_rule-name_
+ parameter or condition
+ _blank line_ (ending parameter or condition declaration)
+ rule

When an at-rule has no parameter or condition (e.g. @charset, @viewport, @font-face) any character (or word) have to be used to fulfill the declaration pattern.

Nested at-rules are not supported!

```html
@import
print

url( 'fineprint.css' )
@

```
Output:
```css
@import url( 'fineprint.css' ) print;
```

```html
@media
screen
and (max-width: 900px)
and (min-height: 500px)

context( stack, keep )
<ol>
        --col_count: 2;
  <li>
          color: red;
  </li>
</ol>
@
```
Output:
```css
@media screen and (max-width: 900px) and (min-height: 500px) {
  ol {
  --col_count: 2;
}
ol > li {
  color: red;
}
}
```
List of supported at-rules:
+ @charset
+ @viewport 
+ @font-face
+ @import
+ @namespace
+ @counter-style
+ @property
+ @keyframes
+ @media
+ @supports


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


### **comment**
<hr/>


#### `context( comment )`

All HTML comments (relative to tags: `<!-- comment -->`) are automatically removed from the generated `.css` file.

By default, all CSS comments (relative to declarations: `/* comment */`) are also removed, unless a context-comment directive has been set (and not commented out by an HTML comment), usually at the begining of the file.


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


### **block**
<hr/>


#### `context( block, identifier )`

Nesting this function in any tag will insert all declarations found in a `<block>` tag with the same identifier.


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

As to improve code reading, an 8-spaces indentation between the opening tag and its declarations is used.<br>
CSS output files are **minified by default**. Unminifying is done using the `--u` argument when invoquing the script.


## Examples

Load this [simple demo][1] of **Contextual-CSS** using the files in the examples tutorial directory and read the [tutorial][2].



[1]: https://github.com/octoxalis/contextual-css/blob/master/examples/tutorial/index.html
[2]: https://github.com/octoxalis/contextual-css/blob/master/examples/tutorial/tutorial.md