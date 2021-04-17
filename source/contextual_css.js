const FS_o  = require( 'fs-extra' )




const REX_o =    //: smartreg: see https://github.com/octoxalis/smartreg
{
  comment_re: /\s+\/\/.*$/gm,
  space_re:   /^\s+|\s+$/gm,
  line_re:    /[\r\n]/g,



  new__re:
  (
    flag_s
  ) =>
  (    //: anonymous function
    string_s,
    ...value_a
  ) =>
  {
    const pattern__s =    //: local function
    (
      pattern_s,
      raw_s,
      at_n
    ) =>
    {
      let value_ =
        value_a
          [at_n]

      if
      (
        value_
        instanceof
        RegExp
      )
      {
        value_ =
          value_
            .source
      }

      return `${pattern_s}${raw_s}${value_ ?? ''}`
    }



    let compile_s =
      string_s
        .raw
          .reduce
          (
            pattern__s,
            ''
          )
    ;[
      REX_o.comment_re,
      REX_o.space_re,
      REX_o.line_re
    ]
      .forEach
      (
        regex_re =>
          compile_s =
            compile_s
              .replace
              (
                regex_re,
                ''
              )
      )
      
    return (
      new RegExp
      (
        compile_s,
        flag_s
      )
    )
  }
}




const I_re =
  REX_o
    .new__re( 'i' )

const GM_re =
  REX_o
    .new__re( 'gm' )

const CONTEXTUAL_INPUT_s = 'html.context.html'

const CONTEXTUAL_OUTPUT_s = './'

const CHILD_SELECTOR_s = '>'

const GENERAL_SIBLING_SELECTOR_s = '~'

const ADJACENT_SIBLING_SELECTOR_s = '+'

const UNIVERSAL_SELECTOR_s = 'uni'




const CSS_o =
{
  
  proceed_a: [],
  
  //-- line_a: [],
  //-- tagStack_a: [],
  //-- copyStack_a: [],
  //-- initStack_a: [],
  //-- path_s: '',
  //-- outputDir_s: ''        //: output directory
  //-- css_s : '',
  //-- ruleset_s: '',
  //-- lastTag_o: {},
  //-- stackState_s: '',    //: stack in selector
  //-- close_b: false,      //: self-closing tag
  //-- class_s: '',         //: replace selector by defined context class

  
  minify_b: false,    //: use context( minify ) to minify output
  stdout_b: false,    //: output to console, not file
  verbose_b: false,   //: output file writing info




  proceed__v:
  () =>
  {
    if
    (
      CSS_o
        .proceed_a
          .length
    )
    {
      const proceed_o =
        CSS_o
          .proceed_a
            .pop()

      CSS_o
        .path_s =
          proceed_o
            .path_s
  
      CSS_o
        .initStack_a =
          proceed_o
            .stack_a
  
      CSS_o
        .read__s()
    }
  }
  ,




  read__s:
  () =>
    FS_o
      .readFile
      (
        CSS_o
          .path_s,
        'utf8' ,
        (            //: callback_f
          error_o,
          ccss_s
        ) =>
        {
          if
          (
            error_o
          )
          {
            return void (
              console
                .log( error_o )
            )
          }
          //>
          if
          (
            CSS_o
              .verbose_b
          )
          {
            console
              .log( `-- Processing: ${CSS_o.path_s}` )
          }

          CSS_o
            .parse__s( ccss_s )
        }
      )
  ,




  write__v:
  (
    path_s,
    css_s
  ) =>
  {
    if
    (
      CSS_o
        .stdout_b
    )
    {
      console
        .log( css_s)

      return
    }

    FS_o
      .writeFile
      (
        path_s,
        css_s,
        'utf8',
        out_o =>    //: callback_f
          {
            if
            (
              CSS_o
                .verbose_b
            )
            {
              console
                .log( `-- Writing ${path_s}: ${out_o}` )
            }
          }
      )
  }
  ,




  parse__s:
  (
    ccss_s
  ) =>
  {
    //======================
    if
    (
      CSS_o
        .verbose_b
    )
    {
      console
        .time('parse__s')
    }
    //======================


    CSS_o
      .init__v( ccss_s )

    for
    (
      let line_s
      of
      CSS_o
        .line_a
    )
    {
      line_s =
        line_s
          .trim()

      if
      (
        ! line_s
      )
      {
        continue
      }

      const method_s =
        CSS_o
          .method__s( line_s )
      
      if
      (
        method_s
      )
      {
        CSS_o
          [ `${method_s}__v` ]( line_s )
      }
    }

    if
    (
      CSS_o
        .ruleset_s    //: last ruleset not yet flushed
    )
    {
      CSS_o
        .close__v()
    }

    //=========================
    if
    (
      CSS_o
        .verbose_b
    )
    {
      console
        .timeEnd('parse__s')
    }
    //=========================

    if
    (
      CSS_o
        .css_s
    )
    {
      CSS_o
        .write__v
        (
          CSS_o
            .path__s(),
          CSS_o
            .css_s
        )
    }

    CSS_o
      .proceed__v()
  }
  ,




  init__v:
  (
    ccss_s
  ) =>
  {
    CSS_o
      .tagStack_a =      //: inherit caller stack
        CSS_o
          .initStack_a
    
    CSS_o
      .copyStack_a = []     //: reset

    CSS_o
      .stackState_s = ''    //: reset


    CSS_o
      .lastTag_o = {}       //: reset
    
    CSS_o
      .ruleset_s = ''       //: reset

    CSS_o
      .css_s = ''           //: reset
      
    CSS_o
      .close_b = false      //: reset
      
    CSS_o
      .minify_b = false     //: reset

    ccss_s =
      ccss_s
        .trim()
        .replace
        (
          GM_re
            `
            <!--        //: HTML comment opening
            [\s\S]*?    //: anything inside
            -->         //: HTML comment closing
            `,          //: pattern:  `<!-- comment -->`
          ''            //: strip HTML comments (before css comments)
        )

    if
    (
      ! I_re
          `
          context        //: contextual function name
          \s?            //: optional space after context function name
          \(             //: function opening parenthesis
          \s?            //: optional space after opening parenthesis
          comment        //: comment argument
          \s?            //: optional space before closing parenthesis
          \)             //: function closing parenthesis
          `              //: pattern:  `context( comment )`
            .test( ccss_s )
    )
    {
      ccss_s =
        ccss_s
          .replace
          (
            GM_re
              `
              \/\*        //: HTML comment opening
              [\s\S]*?    //: anything inside
              \*\/        //: HTML comment closing
              `,          //: pattern:  `/* comment */`
            ''            //: strip CSS comments
          )
    }

    CSS_o
      .line_a =
        ccss_s
          .split( '\n' )
  }
  ,




  path__s:
  () =>
  {
    const path_s =
      CSS_o
        .path_s

    const file_s =
      path_s
        .slice
        (
          path_s
            .lastIndexOf( '/' ) + 1,
          path_s
            .lastIndexOf( '.' )
        )

    return (
      CSS_o
        .outputDir_s
      +
      file_s
        .replace
        (
          '.context',
          ''            //: strip '.context' if present
        )
      +
      '.css'
    )
  }
  ,



  
  method__s:
  (
    line_s
  ) =>
  {
    const char_s =
      line_s[0]
      
    switch
    (
      true
    )
    {
      case
        char_s
        ===
        '<'
      :
        return (
          line_s[1]
          ===
          '/'
          ?
            'close'
          :
            'open'
        )
    
      case
        line_s
        ===
        ADJACENT_SIBLING_SELECTOR_s
      :
      case
        line_s
        ===
        GENERAL_SIBLING_SELECTOR_s
      :
        return 'sibling'
    
      case
        I_re
          `
          context        //: contextual function name
          \s?            //: optional space after context function name
          \(             //: function opening parenthesis
          \s?            //: optional space after opening parenthesis
          ([^\)]+?)      //: anything before closing parenthesis
          \s?            //: optional space before closing parenthesis
          \)             //: function closing parenthesis
          `              //: pattern:  `context( stack, new )`
            .test( line_s )
      :
        return 'context'
    
      default
      :
        return (
          line_s
            .includes( ':' )    //: colon after ruleset property
          ?
            'ruleHead'
          :
            'ruleTail'
        )
    }
  }
  ,



  context__v:
  (
    line_s
  ) =>
  {
    const [ , context_s ] =    //: ignore match[0]
      line_s
        .match
        (
          I_re
            `
            context        //: contextual function name
            \s?            //: optional space after context function name
            \(             //: function opening parenthesis
            \s?            //: optional space after opening parenthesis
            ([^\)]+?)      //: anything before closing parenthesis
            \s?            //: optional space before closing parenthesis
            \)             //: function closing parenthesis
            `              //: pattern:  `context( stack, new )`
        )

    if
    (
      ! context_s
    )
    {
      return void (
        console
          .log( `Error: context() is not valid` )
      )
    }
 
    let [ function_s, arg_s ] =
      context_s
        .replace
        (
          ' ',
          ''
        )
        .split( ',' )

    switch
    (
      true
    )
    {
      case
        function_s
        ===
        'url'
      :
      {
        CSS_o
          .proceed_a
            .push
            ( 
              {
                path_s: `${CSS_o.dir_s}${arg_s}`,
                stack_a: CSS_o
                          .tagStack_a
                            .slice()    //: stack copy
              }
            )
 
        return
      }
 
      case
        function_s
        ===
        'copy'
      :
      {
        CSS_o
          .copyStack_a
            .push
            (
              CSS_o
                .selector__s()
            )

        return
      }
 
      case
        function_s
        ===
        'stack'
      :
      {
        CSS_o
          .stack__v( arg_s )
 
        return
      }
 
      case
        function_s
        ===
        'minify'    //: minify output
      :
      {
        CSS_o
          .minify_b =
          arg_s
            .toLowerCase()
          ===
          'true'
 
        return
      }
    }
   }
  ,
    
 
 
 
   stack__v:
  (
    arg_s
  ) =>
  {
    switch
    (
      arg_s
    )
    {
      case
        'keep'
      :
      {
        CSS_o
          .stackState_s = ''    //: default state
  
        return
      }
    
      case
        'ignore'
      :
      {
        CSS_o
          .stackState_s = 'ignore'
  
        return
      }
    
      case
        'new'    //: reset stack
      :
      {
        CSS_o
          .tagStack_a = []
  
        CSS_o
          .stackState_s = ''    //: default state
  
        return
      }
    }
  }
  ,
    



  ruleHead__v:
  (
    line_s
  ) =>
  {
    CSS_o
      .ruleset_s +=
        line_s
    
    if
    (
      ! CSS_o
          .minify_b
    )
    {
      CSS_o
        .ruleset_s += '\n'
    }
  }
  ,
    



  ruleTail__v:
  (
    line_s
  ) =>
  {
    CSS_o
      .ruleset_s +=
        ' '            //: space before
        +
        line_s

    if
    (
      line_s
        .endsWith( ';' )    //: end of declaration
      &&
      ! CSS_o
          .minify_b
    )
    {
      CSS_o
        .ruleset_s += '\n'
    }
  }
  ,
    



  open__v:
  (
    line_s
  ) =>
  {
    CSS_o
      .sweep__v()

    let endStack_o =
      CSS_o
        .endStack__o()

      while    //: stack popping to find opening tag
      (
        endStack_o
        &&
        (
          ! endStack_o
              .sibling_s
        )
        &&
        (
          endStack_o
            .tie_s
          !==
          CHILD_SELECTOR_s
        )
      )
      {
        CSS_o
          .flush__v()

        endStack_o =
          CSS_o
            .endStack__o()
      }

    let end_n =
      CSS_o
        .tagStack_a
          .length

    if
    (
      end_n
    )
    {
      CSS_o
        .tagStack_a
          [end_n - 1]
            .sibling_s = ''    //: reset
    }

    const tag_s =
      CSS_o
        .tag__s( line_s )

    const tagStack_o =
      {
        tag_s: tag_s,
        tie_s: CHILD_SELECTOR_s
      }
      
    CSS_o
      .tagStack_a
        .push( tagStack_o )
  }
  ,
    



  close__v:
  (
    line_s
  ) =>
  {
    CSS_o
      .takeUp__v()

    CSS_o
      .flush__v()

    const tag_s =
      CSS_o
        .tag__s( line_s )

    let endStack_o =
      CSS_o
        .endStack__o()


    if
    (
      endStack_o
      &&
      (
        tag_s
        ===
        endStack_o
          .tag_s
      )
      &&
      (
        endStack_o
          .tie_s
        ===
        CHILD_SELECTOR_s
      )
    )
    {
      CSS_o
        .flush__v()
    }
  }
  ,




  sibling__v:
  (
    line_s
  ) =>
  {
    CSS_o
      .sweep__v()

    const tagStack_o =
      CSS_o
        .lastTag_o

    tagStack_o
      .tie_s =
        line_s

    tagStack_o
      .sibling_s =
        line_s

    CSS_o
      .tagStack_a
        .push( tagStack_o )

  }
  ,
  


  selector__s:
  () =>
  {
    
    if
    (
      CSS_o
        .stackState_s
      ===
      'ignore'
    )
    {
      return (
        CSS_o
          .endStack__o()
            ?.tag_s
        ||
        ''
        )
    }
        
    let selector_s = ''

    let tie_s = ''

    for
    (
      let stack_o
      of
      CSS_o
        .tagStack_a
    )
    {
      selector_s +=
        ! selector_s    //: root selector
        ?
          stack_o
            .tag_s
        :
          ` ${tie_s} `  //: space before and after
          +
          stack_o
            .tag_s
          
      tie_s =
        stack_o.tie_s
    }

    return selector_s
  }
  ,    




  copySelector__s:
  () =>
  {
    let selector_s = ''

    for
    (
      copy_s
      of
      CSS_o
        .copyStack_a
    )
    {
      selector_s +=
        copy_s
        +
        ','      //: rulesset selector separator
        
      if
      (
        ! CSS_o
            .minify_b
      )
      {
        selector_s += '\n'
      }
    }

    CSS_o
      .copyStack_a = []    //: reset

    return selector_s
  }
  ,    




  classSelector__s:
  (
    class_s
  ) =>
  {
    let selector_s =
      CSS_o
        .selector__s()

    if
    (
      CSS_o
        .class_s
    )
    {
      selector_s =
        `/*${selector_s}*/\n`
        +
        CSS_o
         .class_s

      CSS_o
        .class_s = ''    //: reset
    }

    return selector_s
  }
  ,




  tag__s:
  (
    line_s
  ) =>
  {
    let tag_s =
      line_s
        .slice
        (
          1,    //: strip starting '<'
          -1    //: strip ending '>'
        )

    if
    (
      tag_s
        .endsWith( '/' )    //: self-closing tag
    )
    {
      CSS_o
        .close_b = true

      tag_s =
        tag_s
          .slice
          (
            0,
            -1    //: strip ending '/'
          )
    }

    if
    (
      tag_s
        .startsWith( '/' )    //: closing tag
    )
    {
      tag_s =
        tag_s
          .slice( 1 )    //: strip starting '/'
    }

    tag_s =
      tag_s
        .trim()    //: if space before or after tag name

    if
    (
      tag_s
        .startsWith( UNIVERSAL_SELECTOR_s )
    )
    {
      tag_s =
        tag_s
          .replace
          (
            UNIVERSAL_SELECTOR_s,
            '*'
          )
    }

    const match_a =
      tag_s
        .match
        (
          I_re
            `
            [a-z1-6]+?    //: tag name (including h1-h6)
            \s+           //: mandatory space
            class         //: 'class' attribute
            \s*           //: optional space before equal operator
            =             //: equal operator
            \s*           //: optional space after equal operator
            (?:"|')       //: opening quote or double quote
            ([^"']+?)     //: anything as quoted value
            (?:"|')       //: closing quote or double quote
            `             //: pattern:  `h1 class="header"`
        )
    
    if
    (
      match_a
        ?.length
    )
    {
      tag_s =
        `.${match_a[1]}`
    }

    return tag_s
  }
  ,    




  flush__v:
  () =>
  {
    CSS_o
      .lastTag_o =
        CSS_o
          .tagStack_a
            .pop()
  }
  ,



  takeUp__v:
  () =>
  {
    if
    (
      CSS_o
        .ruleset_s
    )
    {
      CSS_o
        .css_s +=
          CSS_o
            .copySelector__s()
          +
          CSS_o
            .classSelector__s()
          +
          ' {'      //: space before

      if
      (
        ! CSS_o
            .minify_b
      )
      {
        CSS_o
          .css_s += '\n'
      }

      CSS_o
        .css_s +=
          CSS_o
            .ruleset_s
          +
          '}'

      if
      (
        ! CSS_o
          .minify_b
      )
      {
        CSS_o
          .css_s += '\n\n'
      }
    
      CSS_o
        .ruleset_s = ''    //: reset
    }
  }
  ,




  sweep__v:
  () =>
  {
    CSS_o
      .takeUp__v()    //: previous tag has hanging ruleset

    if
    (
      CSS_o
        .close_b    //: previous tag was self-closing
    )
    {
      CSS_o
        .flush__v()
        
      CSS_o
        .close_b = false    //: reset
    }

  }
  ,




  endStack__o:
  () =>
  {
    let end_n =
      CSS_o
        .tagStack_a
          .length

    return (
      ! end_n
      ?
        null
      :
        CSS_o
          .tagStack_a
            [end_n - 1]
    )
  }
  ,
}



void function
()
{
  const help_s =
    `Valid arguments:
    \t(1) [optional] input file path (default: html.context.html),
    \t(2) [optional] output directory path (default: ./)
    \t(3) [optional] --s (output to stdout)
    \t(4) [optional] --v (verbose)`

  let arg_a =
    process
      .argv
        .slice( 2 )

  if
  (
    arg_a
      .includes( '--h' )
  )
  {
    console
      .log( help_s )

    arg_a =
      arg_a
        .filter
        (
          slot_s => slot_s !== '--h'
        )
  }

  if
  (
    arg_a
      .includes( '--v' )
  )
  {
    CSS_o
      .verbose_b =
        true

    arg_a =
      arg_a
        .filter
        (
          slot_s => slot_s !== '--v'
        )
  }

  if
  (
    arg_a
      .includes( '--s' )
  )
  {
    CSS_o
      .stdout_b =
        true

    arg_a =
      arg_a
        .filter
        (
          slot_s => slot_s !== '--s'
        )
  }

  const path_s =
    arg_a
      [0]      //: input file (*.context.html)
    ||
    CONTEXTUAL_INPUT_s

  CSS_o
    .outputDir_s =
      arg_a
        [1]    //: output file (*.css) directory
      ||
      CONTEXTUAL_OUTPUT_s

  if
  (
    path_s
    &&
    CSS_o
      .outputDir_s
  )
  {
    CSS_o
      .dir_s =
        path_s
          .slice
          (
            0,
            path_s
              .lastIndexOf( '/' ) + 1
          )
  
    CSS_o
      .proceed_a
        .push
        ( 
          {
            path_s: path_s,
            stack_a: []
          }
        )
  
    CSS_o
      .proceed__v()

    return
  }

  console
    .log( help_s )
}()
