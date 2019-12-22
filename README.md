
# rolled
clone & customized stage0 for better developer experiments
> if Freak613 wants close this repo, i will archive it...

> please do not use product... X_X

## TODO LIST

1. change styles.js 
    - [x] non-duplicated css feature remove
    - [ ] we things about composition for css or style
2. change index.js
    - [ ] remake for auto collect use with template literals
      - [x] reject (cause of cost)
    - [ ] auto bind mutation event (ex : reconcile);
    - [x] support fragment (use documentFragment)
        - [x] reconcile, keyed support
## doc

### fragment
basic fragment usage (reconcile support),
full contents in '/examples/test.html'
```javascript
    import {fragment} from 'rolled'
    const itemGroup = fragment`
        <td>#name</td>
        <td>#id</td>
    `;
    const createItem = (item) => {
        const root = itemGroup.cloneNode(true);
        const childNodes = root.childNodes;
        const childSize = childNodes.length;
        const update = (old, view) => function (item) {
            const collector = view.collect(this);
            for (const key in collector) {
                const current = item[key];
                if (current !== old[key]) {
                    collector[key].nodeValue = current;
                }  
            }
        }
        for (let index = 0; index < childSize; index++) {
            const node = childNodes[index];
            const view = itemGroup.childNodes[index];
            node.update = update(item, view);
            update({}, view).call(node, item);
        }
        return root;
    }
```

## License

[stage0 License](https://github.com/Freak613/stage0/blob/master/LICENSE)

[rolled License](https://github.com/CreeJee/rolled/blob/master/LICENSE)
