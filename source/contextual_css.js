const FS_o  = require( 'fs-extra' )

const CONTEXTUAL_INPUT_s =
  'html.context.html'

const CONTEXTUAL_OUTPUT_s =
  './'



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
  verbose_b: false,

  CHILD_SELECTOR_s: '>',
  GENERAL_SIBLING_SELECTOR_s: '~',
  ADJACENT_SIBLING_SELECTOR_s: '+',


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
    FS_o
      .writeFile
      (
        path_s,
        css_s,
        'utf8',
        out_o =>    //: callback
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
      .clean__v( ccss_s )

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




  clean__v:
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
      
    ccss_s =
      ccss_s
        .trim()
        .replace
        (
          /<!--[\s\S]*?-->/gm,  //: strip HTML comments (before css comments)
          ''
        )

    if
    (
      ccss_s
        .includes( 'cssComment' )  //: as context( cssComment )
    )
    {
      ccss_s =
        ccss_s
          .replace
          (
            /\/\*[\s\S]*?\*\//gm,  //: strip CSS comments
            ''
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

    return `${CSS_o.outputDir_s}${file_s}.css`
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
        CSS_o
          .ADJACENT_SIBLING_SELECTOR_s
      :
      case
        line_s
        ===
        CSS_o
          .GENERAL_SIBLING_SELECTOR_s
      :
        return 'sibling'
    
      case
        /context\s?\(\s?([^\)]+?)\s?\)/i
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
        .match( /context\s?\(\s?([^\)]+?)\s?\)/i )

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
                            .slice()    //: copy
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
        'stack'    //: must be invoqued between two tags at the same level
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
          .minify_b = true
 
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
          CSS_o
            .CHILD_SELECTOR_s
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
        tie_s: CSS_o
          .CHILD_SELECTOR_s
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
    ;console.table( CSS_o.tagStack_a )
    
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
        CSS_o
          .CHILD_SELECTOR_s
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
  


  sweep__v:
  () =>
  {
    CSS_o
      .takeUp__v()    //: hanging previous tag ruleset

    if
    (
      CSS_o
        .close_b    //: previous enclosed tag was self-closing
    )
    {
      CSS_o
        .flush__v()
        
      CSS_o
        .close_b = false    //: reset
    }

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

    const match_a =
      tag_s
        .match( /[a-z1-6]+?\s+class\s*=\s*(?:"|')([^"']+?)(?:"|')/i )
    
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
  const path_s =
    process
      .argv
        .slice( 2 )
          [0]      //: input file (*.context.html)
    ||
    CONTEXTUAL_INPUT_s

  CSS_o
    .outputDir_s =
      process
        .argv
          .slice( 2 )
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
    .log( `Invalid arguments: 1. input file path, 2. output directory path)` )
}()
