const itemView = h`
<table>
    <tbody>
        <tr #ref>
        </tr>
    </tbody>
</table>
`;
const itemGroup = fragment`
    <td>#name</td>
    <td>#id</td>
`;

const update = (old, view) => {
    //needs bound self
    return function __nestedUpdate__(item) {
        const collector = view.collect(this);
        for (const key in collector) {
            const current = item[key];
            if (current !== old[key]) {
                collector[key].nodeValue = current;
            }
        }
    };
};
const createItem = (item) => {
    const root = itemGroup.cloneNode(true);
    let rootChild = root.firstChild;
    let itemChild = itemGroup.firstChild;
    let nth = 0;
    if (rootChild === null || itemChild === null) {
        return root;
    }
    do {
        rootChild.update = update(item, itemChild);
        update({}, itemChild).call(rootChild, item);
    } while (
        (rootChild = rootChild.nextSibling) &&
        (itemChild = itemChild.nextSibling)
    );

    // const childNodes = root.childNodes;
    // const childSize = childNodes.length;
    // for (let index = 0; index < childSize; index++) {
    //     const node = childNodes[index];
    //     const view = itemGroup.childNodes[index];
    //     node.update = update(item, view);
    //     update({}, view).call(node, item);
    // }
    return root;
};
const factory = (view) => {
    const data = [
        { name: "o", id: 1 },
        { name: "k", id: 2 }
    ];
    const { ref } = view.collect(view);
    let renderedItems = [];

    view.update = function(data) {
        reconcile(
            ref,
            renderedItems,
            data,
            (item) => createItem(item),
            (node, item) => node.update(item)
        );
        renderedItems = data.slice();
    };
    view.update(data);
    return view;
};
const mainRoot = factory(itemView);
