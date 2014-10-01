Granola (WIP)
=======

Granola is the first OOLESS (Object-Oriented Less) library. From the makers of Crunch!

**NOTE:** This project is just starting and, as such, is not intended for production use...yet.

How is Granola different?
===
First, let's talk about how people have used CSS pre-processors up until this point. CSS pre-processors (like Less, SASS, and Stylus) are typically used to abstract out CSS values, and repeated property / value pairs.

Such as:

```
@accent-color: red;

.call-to-action {
  border: 1px solid @accent-color;
}
.important-button {
  background-color: @accent-color;
}
```

...or in the case of repeated properties:

```
.clearfix() {
  // I do clearfixy things
}
.floaty-box {
  .clearfix(); // I need clearfixy things here
}
.other-floaty-box {
  .clearfix(); // I also need clearfixy things here
}
```

Libraries like Less can be tremendously useful to abstract out these parts. But Less is capable of much more. Using a pre-processor can **enable you to create a design pattern that has no CSS equivalent**.

Wait, what?
===
Let me explain. CSS is a direct mapping system between element references (elements, classes, and ids) and specific styles and art assets. You cannot define styles without specifying *what specific elements they apply to*. With Less, you can abstract out your styles, but you can **also abstract out your element references**.

Put another way: you can define your art assets separately from the elements they apply to.

For an illustration, let's look at a popular example: Bootstrap.
```
.panel {
  margin-bottom: @line-height-computed;
  background-color: @panel-bg;
  border: 1px solid transparent;
  border-radius: @panel-border-radius;
  .box-shadow(0 1px 1px rgba(0,0,0,.05));
}

// Panel contents
.panel-body {
  padding: @panel-body-padding;
  &:extend(.clearfix all);
}

// Optional heading
.panel-heading {
  padding: 10px 15px;
  border-bottom: 1px solid transparent;
  .border-top-radius((@panel-border-radius - 1));

  > .dropdown .dropdown-toggle {
    color: inherit;
  }
}
```
Bootstrap uses a lot of varaibles, so there's a lot of customization possible here. But what if you would like to use Bootstrap on a site that already exists? What if you want to need or use different class names? Bootstrap offers custom "builds", but what if you want to only apply specific "styles" to specific declared elements?

Bootstrap still treats Less like CSS. That is, it is specifying what elements these styles apply to, and requires you to design your markup in a specific way using specific, pre-defined classes. If you've already defined your elements, or your website was already built without Bootstrap, too bad.

In an OOLESS library like Granola, art assets and styles are defined with few specifics about what element(s) they will be applied to. Elements are defined separately, in an object-oriented manner. Meaning that Granola is not a UI library. Granola is a definition of an object-oriented Less structure to make styles and element references swappable, and make granular application of styles possible.

What's Possible With Granola
===
Say you wanted to use the type of button styles of Bootstrap, but a custom "mapping" of element and class names.
```
@import "granola";
@import "styles/bootstrap";
@import "elements/customelements";
#granola > .start();
```
Say you then decided later to instead use "metro-style" buttons on your project, but you'd already created all your markup, so you wanted to keep your custom element names.
```
@import "granola";
@import "styles/metro";
@import "elements/customelements";
#granola > .start();
```
You're liking how this looks. You like the metro style so much, you want to apply these styles to an existing website, but that website was built using Bootstrap. No problem.
```
@import "granola";
@import "styles/metro";
@import "elements/bootstrap";
#granola > .start();
```
Hmm... there are a lot more class names than you really need. Your CSS is too big. How about just a custom build of just buttons and nothing else?

```
@import "granola";
@import "styles/metro";
@import "elements/bootstrap";
#granola > .start(@all: false, @buttons: true);
```
Do you really like metro? Maybe it's a little flat and square. How about really round buttons?
```
@import "granola";
@import "styles/rounded";
@import "elements/bootstrap";
#granola > .start(@all: false, @buttons: true);
```
Only, make primary buttons red.
```
@import "granola";
@import "styles/rounded";
@import "elements/bootstrap";
#granola {
  .vars() { @primary-button-color: red; }
}
#granola > .start(@all: false, @buttons: true);
```
No, never mind, all you want is just one single button with that style.
```
@import "granola";
@import "styles/rounded";
/* @import "elements/bootstrap"; --Forget this, I'll do it myself */
#granola {
  .vars() { @primary-button-color: red; }
}
#granola > .start(@all: false, @buttons: true);

.one-button-to-rule-them-all {
  #granola > .buttons > .primary; // render the styles
}
```
You know what, though? This round style is really fantastic. Let's put them back on our first project. (You're very fickle, aren't you?)
```
@import "granola";
@import "styles/rounded";
@import "elements/customelements";
#granola > .start();
```

In Summary
===
This is only the tip of the iceberg of what you can do with an OOLESS pattern, and what you can do with Granola. 

Is there any project I can't or shouldn't use Granola on?
===
That's a silly question. Obviously, the answer is no.
