const FS_o  = require( 'fs-extra' )




const REX_o =    //: smartreg: see https://github.com/octoxalis/smartreg
{
  new__re:
  (
    flag_s
  ) =>
  (                //: anonymous function
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

    for
    (
      regex_re
      of
      [
        /\s+\/\/.*$/gm,    //:comment
        /^\s+|\s+$/gm,     //:space
        /[\r\n]/g,         //:line
      ]
    )
    {
      compile_s =
        compile_s
          .replace
          (
            regex_re,
            ''
          )
    }
      
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



const UN_o =
{
  INDENTATION_s: '  ',    //: 2 spaces




  write__s:
  (
    css_s
  ) =>
  {
    css_s = css_s
        .replace
        (
          GM_re
            `
            \s*
            {
            \s*
            `,       //: pattern: ` { `
          ` {\n${UN_o.INDENTATION_s}`
        )
        .replace
        (
          GM_re
          `
          ;
          \s*
          `,           //: pattern: `; `
          `;\n${UN_o.INDENTATION_s}`
        )
        .replace
        (
          GM_re
          `
          ,
          \s*
          `,         //: pattern: `, `
          `, `
        )
        .replace
        (
          GM_re
          `
          [ ]*  
          \}
          \s*
          `,         //: pattern: ` }`
          `}\n`
        )
        .replace
        (
          GM_re
          `
          \}
          \s*
          (.+)
          `,          //: pattern: `} ...`
          `}\n$1`
        )
        .replace
        (
          GM_re
          `
          \n
          \s{2}        //: double space
          ([^:]+)      //: property name
          :
          \s*
          `,           //: pattern: `property: `
          `\n${UN_o.INDENTATION_s}$1: `
        )
        .replace
        (
          GM_re
          `
          (
          [A-Za-z0-9\)]
          )
          \}
          `,             //: pattern: `10px)}`
          `$1;\n}`
        )
        .replace
        (
          GM_re
          `
          \n
          ${UN_o.INDENTATION_s}
          @
          `,             //: pattern: ` @`  (at-rule)
          `\n@`          //: at line start
        )
    return css_s
  }
}




const CSS_o =
{
  INPUT_s:            'html.context.html',    //: default output
  OUTPUT_s:           './',                   //: default input directory
  CHILD_s:            '>',
  GENERAL_SIBLING_s:  '~',
  ADJACENT_SIBLING_s: '+',
  BLOCK_s:            'block',
  TAG_START_s:        '<',
  AT_RULE_s:          '@',
  AT_RULE_a:          //: at-rule keywords
  [
    'charset',        //: 0 argument
    'viewport',       //: idem
    'font-face',      //: idem

    'import',         //: 1 argument
    'namespace',      //: idem
    'counter-style',  //: idem
    'property',       //: idem
    'keyframes',      //: idem

    'media',
    'supports',
  ],
  CONTEXT_re:      //: pattern:  `context( stack, new )`
    I_re
    `
    context        //: contextual function name
    \s?            //: optional space after context function name
    \(             //: function opening parenthesis
    \s?            //: optional space after opening parenthesis
    ([^\)]+?)      //: anything before closing parenthesis
    \s?            //: optional space before closing parenthesis
    \)             //: function closing parenthesis
    `,
  
  proceedStack_a: [],    //: FIFO
  block_a: [],
  
  //-- line_a: [],
  //-- line_n: 0,         //: line_a iterator index
  //-- tagStack_a: [],    //: LIFO
  //-- copyStack_a: [],   //: LIFO
  //-- initStack_a: [],   //: LIFO
  //-- path_s: '',
  //-- outputDir_s: ''        //: output directory
  //-- css_s : '',
  //-- ruleset_s: '',
  //-- lastTag_o: {},
  //-- atRule_o: {},
  //-- stackState_s: '',    //: stack in selector
  //-- class_s: '',         //: replace selector by defined context class
  //-- close_b: false,      //: self-closing tag

  stdout_b:   false,  //: output to console, not file
  unminify_b: false,  //: minified output
  verbose_b:  false,  //: output file writing info




  proceed__v:
  () =>
  {
    if
    (
      CSS_o
        .proceedStack_a
          .length
    )
    {
      const proceed_o =
        CSS_o
          .proceedStack_a
            .shift()

      CSS_o
        .path_s =
          proceed_o
            .path_s

      CSS_o
        .initStack_a =
          proceed_o
            .stack_a
  
      CSS_o
        .read__v()
    }
  }
  ,




  read__v:
  () =>
    FS_o
      .readFile
      (
        CSS_o
          .path_s,
        'utf8' ,
        (            //: callback_f
          error_o,
          parse_s
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
          CSS_o
            .parse__v( parse_s )
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
        .unminify_b
    )
    {
      css_s =
        UN_o
          .write__s( css_s )
    }

    if
    (
      CSS_o
        .stdout_b
    )
    {
      console
        .log( `\n----\nWriting ${path_s}\n----\n` )

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
              const out_s =
                out_o
                ?
                  'ERROR'
                :
                  'OK'

              console
                .log( `\n----\nWriting ${path_s}: (${out_s})\n----\n` )
            }
          }
      )
  }
  ,




  parse__v:
  (
    parse_s
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
        .time('parse__v')
    }
    //======================


    CSS_o
      .init__v( parse_s )

    while
    (
      CSS_o
        .line_n
      <
      CSS_o
        .line_a
          .length
    )
    {
      let line_s =
        CSS_o
          .line_a
            [CSS_o.line_n++]
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
        .timeEnd('parse__v')
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
    parse_s
  ) =>
  {
    parse_s =
      parse_s
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
          .test( parse_s )
    )
    {
      parse_s =
        parse_s
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
        parse_s
          .split( '\n' )

    CSS_o
      .line_n = 0

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
      .atRule_o = {}        //: reset

    CSS_o
      .css_s = ''           //: reset
      
    CSS_o
      .close_b = false      //: reset
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
        CSS_o.TAG_START_s
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
        char_s
        ===
        CSS_o.AT_RULE_s
      :
        return 'atRule'

      case
        line_s
        ===
        CSS_o.ADJACENT_SIBLING_s
      :
      case
        line_s
        ===
        CSS_o.GENERAL_SIBLING_s
      :
        return 'sibling'
    
      case
        CSS_o
          .CONTEXT_re
            .test( line_s )
      :
        return 'context'
    
      default
      :
        return 'rule'
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
          CSS_o
            .CONTEXT_re
        )

    if
    (
      ! context_s
    )
    {
      return void (
        console
          .log( `Error: invalid context function` )
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
      function_s
    )
    {
      case
        'url'
      :
      {
        CSS_o
          .proceedStack_a
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
        'block'
      :
      {
        let block_s =
          CSS_o
            .block_a
              [arg_s]

        if
        (
          ! block_s
        )
        {
          const error_s =
            `ERROR: "${arg_s}" statements block is missing`
            
          console.log( error_s )

          block_s =
          `/* ${error_s} */\n`
        }

        CSS_o
          .ruleset_s +=
            block_s

        return
      }
 
      case
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
        'stack'
      :
      {
        CSS_o
          .stack__v( arg_s )
 
        return
      }
    }
   }
  ,
    
 
 
 
  stack__v:
  (
    state_s
  ) =>
  {
    switch
    (
      state_s
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
    


  rule__v:
  (
    line_s
  ) =>
  {
    CSS_o
      .ruleset_s +=
        line_s
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
          CSS_o.CHILD_s
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

    if
    (
      tag_s
        .startsWith( CSS_o.BLOCK_s )
    )
    {
      CSS_o
        .block_s =
          CSS_o
            .block__s( line_s )
    }

    const tagStack_o =
      {
        tag_s: tag_s,
        tie_s: CSS_o.CHILD_s
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
        CSS_o.CHILD_s
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
  


  block__s:
  (
    line_s
  ) =>
  {
    line_s =
      line_s
        .slice
        (
          1,    //: strip starting '<'
          -1    //: strip ending '>'
        )

    return (
      line_s
        .replace
        (
          CSS_o.BLOCK_s,
          ''
        )
        .trim()
    )
  }
  ,




  atRule__v:
  (
    line_s
  ) =>
  {
    const keyword_s =
      line_s
        .slice( 1 )      //: skip CSS_o.AT_RULE_s
        

    if
    (
      ! keyword_s    //: closing @media || @supports -> takeup
    )
    {
      CSS_o
        .css_s +=
          `@${CSS_o.atRule_o.keyword_s} `  //: space
          + `${CSS_o.atRule_o.target_s} `    //: space
          + `{`
          + `${CSS_o.atRule_o.css_s}`
          + `}`

      CSS_o
        .atRule_o = {}    //: reset

      return
    }
    //>
    
    let target_s = ''    //: target, condition, name

    let target_b = false

    let statement_s = ''

    while    //: parse lines till start of statements (@media, @supports) or end (other at-rules)
    (
      CSS_o
        .line_n
      <
      CSS_o
        .line_a
          .length
    )
    {
      let line_s =
        CSS_o
          .line_a
            [CSS_o.line_n++]
              .trim()

      if
      (
        line_s
        ===
        CSS_o.AT_RULE_s    //: closing at-rule
      )
      {
        if
        (
          CSS_o.AT_RULE_a
            .includes( keyword_s )
          &&
          statement_s
        )
        {
          CSS_o
            .css_s +=
              CSS_o
                .atRule__s
                (
                  keyword_s,
                  target_s,
                  statement_s
                )
        }

        break
      }

      if
      (
        ! target_s    //: start target_s parsing
      )
      {
        target_s =
          line_s

        target_b =
          true

        continue
      }

      if
      (
        ! line_s       //: empty line to end target_s list
        && target_b    //: target_s parsing finished
      )
      {
        target_b =
          false      //: reset

        continue
      }

      if
      (
        target_b    //: still parsing target_s - test after previous one
      )
      {
        target_s +=
          ` ${line_s}`    //: space separator before

        continue
      }

      if
      (
        keyword_s
        ===
        'media'
        ||
        keyword_s
        ===
        'supports'    //: let html parse at-rule statements
      )
      {
        CSS_o
          .atRule_o =
            {
              keyword_s: keyword_s,
              target_s: target_s,
              statement_s: statement_s,
              css_s: ''
            }

        return
      }
      //>
      statement_s +=      //: follow on parsing statements
        line_s
    }
  }
  ,


  atRule__s:
  (
    keyword_s,
    target_s,
    statement_s
  ) =>
  {
    let atRule_s

    statement_s =
      statement_s
        .replaceAll
        (
          ': ',
          ':'      //: remove space
        )
        .trim()

    switch
    (
      keyword_s
    )
    {
      case
        'import'
      :
        atRule_s =
          CSS_o
            .checkRuleEnd__s
            (
              `@${keyword_s} ${statement_s} ${target_s}`
            )

        break
    
      case
        'charset'
      :
        atRule_s =
          CSS_o
            .checkRuleEnd__s
            (
              `@${keyword_s} ${statement_s}`
            )

        break
    
      case
        'namespace'
      :
        atRule_s =
          CSS_o
            .checkRuleEnd__s
            (
              `@${keyword_s} ${target_s} ${statement_s}`
            )

        break
    
      case
        'viewport'
      :
      case
        'font-face'
      :
        atRule_s =
          `@${keyword_s} {${statement_s}}`

        break
    
      //--case
      //--  'counter-style'
      //--:
      //--case
      //--  'property'
      //--:
      //--case
      //--  'keyframes'
      //--:
      default
      :
        atRule_s =
          `@${keyword_s} ${target_s} {${statement_s}}`

        break
    }

    return atRule_s
  }
  ,



  checkRuleEnd__s:
  (
    atRule_s
  ) =>
    atRule_s
      .endsWith( ';' )
    ?
      atRule_s
    :
      atRule_s
      +
      ';'
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
        ','      //: ruleset separator
    }

    CSS_o
      .copyStack_a = []    //: reset

    return selector_s
  }
  ,    




  classSelector__s:
  () =>
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
        `/*${selector_s}*/`
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
      if
      (
        CSS_o
          .block_s
      )
      {
        CSS_o
          .block_a
            [CSS_o.block_s] =
              CSS_o
                .ruleset_s

        CSS_o
          .block_s = ''    //: reset
      }
      else
      {
        let css_s =
          CSS_o
            .copySelector__s()
          +
          CSS_o
            .classSelector__s()
          +
          ' {'      //: space before
  
        css_s +=
          CSS_o
            .ruleset_s
          +
          '}'

        if
        (
          CSS_o
            .atRule_o
              .keyword_s
        )
        {
          CSS_o
            .atRule_o
              .css_s +=
                css_s
        }
        else
        {
          CSS_o
            .css_s +=
              css_s
        }
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
    \t(3) [optional] --s (stdout output)
    \t(4) [optional] --u (unminify output)
    \t(5) [optional] --v (verbose)
    \t(5) [optional] --h (help)`

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

    return
  }
  //>

  for
  (
    let arg_s
    of
    [
      'stdout',
      'unminify',
      'verbose'
    ]
  )
  {
    const argChar_s =
      arg_s[0]

    if
    (
      arg_a
        .includes( `--${argChar_s}` )
    )
    {
      CSS_o
        [`${arg_s}_b`] =
          true
  
       arg_a =
         arg_a
           .filter
           (
             slot_s => slot_s !== `--${argChar_s}`
           )
    }
  }

  const invalidArg_a = []

  for
  (
    let arg_s
    of
    arg_a
  )
  {
    if
    (
      arg_s
        .startsWith( '-' )    //: parameter start
    )
    {
      invalidArg_a
        .push( arg_s )
    }
  }

  if
  (
    invalidArg_a
      .length
  )
  {
    console
      .log( `Invalid command parameter(s): ${invalidArg_a}\n\n${help_s}` )
    
    return
  }

  let path_s

  let outputDir_s

  switch
  (
    arg_a
      .length
  )
  {
    case
      2
    :
      [ path_s, outputDir_s ] =
        arg_a
          
      break

    case
      1
    :
      if
      (
        arg_a
          [0]
            .endsWith( '/' )    //: directory
      )
      {
        outputDir_s =
          arg_a
            [0]    //: output file (*.css) directory
  
        path_s =
          CSS_o
            .INPUT_s
      }
      else
      {
        path_s =
          arg_a
            [0]      //: input file (*.context.html)
      }
        
      break

    default
    :
      path_s =
        CSS_o
          .INPUT_s
    
      outputDir_s =
        CSS_o
          .OUTPUT_s
  }

  if
  (
    path_s
    &&
    outputDir_s
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
      .outputDir_s =
        outputDir_s

    CSS_o
      .proceedStack_a
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
