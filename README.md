
# rolled
well hooked & better flow control
> if Freak613 wants close this repo, i will archive it...
> please do not use product... X_X

## TODO LIST

1. change
    - [x] non-duplicated css feature remove
    - [ ] we things about composition for css or style
2. change main logic
    - [ ] auto bind mutation event (ex : reconcile);
      - [ ] hook
        - [ ] core 
          - [x] not global object but own context & scoping
          - [ ] batching tasks
            - [x] layout tasks
            - [x] mutation tasks
            - [ ] testing benchmark
        - [x] useState
        - [x] useEffect
          - [x] on removed all $dom Array in hooks then fired unMount
        - [ ] really need?
          - [x] useContext
          - [ ] useRef
          - [ ] useImperativeHandle
          - [ ] useLayoutEffect
          - [ ] useDebugValue
        - [x] useReducer
        - [x] component mutation is applied only tags, not component so we will not implements
          - [x] useCallback
          - [x] useMemo
      - [ ] like Functional component things
      - [ ] NEW action
        - [ ] pipe
        - [ ] combineHook
        - [ ] genericBounder
        - [x] useHook
        - [x] bindGlobalHook
        - [ ] NEED MORE IDEA....
      - [ ] [hyperscript](https://github.com/hyperhype/hyperscript) interface in component
        - [ ] recycle dom values
      - [ ] layout effects used object item or props values
    - [x] support fragment (use documentFragment)
      - [x] reconcile, keyed support
      - [x] fragment is now added collecting nodes
      - [ ] h & fragment support template liternals props
        - [ ] auto marked data
        - [ ] 
## doc

### fragment
basic fragment usage (reconcile support),
examples in '/examples/test.html'

### hook
hook examples in '/examples/useRecolience.html'

## License
[stage0 License](https://github.com/Freak613/stage0/blob/master/LICENSE)
[rolled License](https://github.com/CreeJee/rolled/blob/master/LICENSE)
