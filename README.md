
# rolled
clone & customized stage0 for better developer experiments
> if Freak613 wants close this repo, i will archive it...

> please do not use product... X_X

## TODO LIST

1. change
    - [x] non-duplicated css feature remove
    - [ ] we things about composition for css or style
2. change main logic
    - [ ] auto bind mutation event (ex : reconcile);
      - [ ] hook
        - [ ] not global object but own context & scoping
        - [x] useState
        - [x] useEffect
        - [ ] useContext
          - [x] taskIn....
        - [ ] useReducer
        - [ ] useCallback
        - [ ] useMemo
        - [ ] useRef
        - [ ] useImperativeHandle
        - [ ] useLayoutEffect
        - [ ] useDebugValue
      - [ ] like Functional component things
      - [ ] [hyperscript](https://github.com/hyperhype/hyperscript) interface in component
        - [ ] recycle dom values
      - [ ] layout effects used object item or props values
    - [x] support fragment (use documentFragment)
        - [x] reconcile, keyed support
## doc

### fragment
basic fragment usage (reconcile support),
examples in '/examples/test.html'

### hook
hook examples in '/examples/useRecolience.html'

## License
[stage0 License](https://github.com/Freak613/stage0/blob/master/LICENSE)
[rolled License](https://github.com/CreeJee/rolled/blob/master/LICENSE)
