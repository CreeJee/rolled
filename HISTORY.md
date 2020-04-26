## history

### version 0.10

-   virtual component
    -   built DomComponent added
-   hooks
    -   Search store value from parent Context method added (like react Context)

### version 0.10-alpha

-   virtual component
    -   virtual generator added
    -   dom ref Component added (used exist dom Element)
-   hook/basic
    -   reactiveTagMount added

### version 0.09

-   optimized renderer source logic
    -   now "hElement.collect" is must active after useEffect
    -   fast create path is used DocumentFragment
-   change directoy struct
