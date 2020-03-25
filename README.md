
# rolled
## info
### well hooked & better flow control
> if Freak613 wants close this repo, i will archive it...
> please do not use product... X_X


## TODO LIST

1. styled.js
    - [x] non-duplicated css feature remove
2. main logic
    - [ ] hook
      - [ ] core 
        - [x] not global object but own context & scoping
        - [ ] batching tasks
          - [x] layout tasks
          - [x] mutation tasks
            - [x] unMount mutation connect  
          - [ ] testing benchmark
        - [x] memo
        - [x] lazy
        - [ ] slot support
          - [ ] example ```javascirpt h`<div>#children</div>` ```
      - [ ] hooks
        - [x] useState
        - [x] useEffect
          - [x] on removed all $dom Array in hooks then fired unMount
        - [x] useReducer
      - [x] useLayoutState
      - [ ] really need?
        - [ ] useCallback
        - [ ] useMemo
        - [x] useContext
        - [ ] useRef
        - [ ] useImperativeHandle
        - [ ] useLayoutEffect
        - [ ] useDebugValue
    - [ ] like Functional component things
    - [ ] NEW action
      - [x] useHook
      - [x] useChannel(channel: string|symbol) => [currentContext, send => {}]
      - [x] reactiveMount
      - [ ] NEED MORE IDEA....
    - [x] custom renderer
    - [x] layout effects used props values
  - [x] support fragment (use documentFragment)
    - [x] reconcile, keyed support
    - [x] fragment is now added collecting node
## doc

### basic
examples in '/examples/test.html'

### hook
examples in '/examples/useRecolience.html'

## example project

## License
[stage0 License](https://github.com/Freak613/stage0/blob/master/LICENSE)
[rolled License](https://github.com/CreeJee/rolled/blob/master/LICENSE)
