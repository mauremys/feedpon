export interface Trie<T> {
    [key: string]: Node<T>;
}

export interface Node<T> {
    children: Trie<T>;
    value?: T;
}

export function empty<T>(): Trie<T> {
    return {};
}

export function create<T>(iterable: Iterable<[string[], T]>): Trie<T> {
    const tree = {};

    for (const [path, value] of iterable) {
        mutableUpdate(tree, path, value);
    }

    return tree;
}

export function find<T>(tree: Trie<T>, path: string[]): Node<T> | null {
    let children = tree;
    let node = null;

    for (const key of path) {
        if (!(key in children)) {
            return null;
        }
        node = children[key];
        children = node.children;
    }

    return node;
}

export function has<T>(tree: Trie<T>, path: string[]): boolean {
    let children = tree;
    let node = null;

    for (const key of path) {
        if (!(key in children)) {
            return false;
        }
        node = children[key];
        children = node.children;
    }

    return true;
}

export function update<T>(tree: Trie<T>, path: string[], value: T): Trie<T> {
    if (path.length === 0) {
        return tree;
    }

    const key = path[0];
    const node = tree[key] || { children: {} };

    if (path.length > 1) {
        return {
            ...tree,
            [key]: {
                children: update(node.children, path.slice(1), value),
                value: node.value
            }
        };
    }

    return {
        ...tree,
        [key]: { children: node.children, value }
    };
}

export function mutableUpdate<T>(tree: Trie<T>, path: string[], value: T): void {
    if (path.length === 0) {
        return;
    }

    const key = path[0];
    const node = tree[key] || { children: {} };

    if (path.length > 1) {
        mutableUpdate(node.children, path.slice(1), value);
    } else {
        node.value = value;
    }

    tree[key] = node;
}

export function remove<T>(tree: Trie<T>, path: string[]): Trie<T> {
    if (path.length === 0) {
        return tree;
    }

    const key = path[0];
    const node = tree[key];

    if (!node) {
        return tree;
    }

    if (path.length > 1) {
        return {
            ...tree,
            [key]: {
                children: remove(node.children, path.slice(1)),
                value: node.value
            }
        };
    }

    if (!isEmpty(node.children)) {
        return {
            ...tree,
            [key]: {
                children: node.children
            }
        };
    }

    return deleteObjectKey(tree, key);
}

export function isEmpty<T>(tree: Trie<T>): boolean {
    for (const _key in tree) {
        return false;
    }
    return true;
}

export function* iterate<T>(tree: Trie<T>, root: string[] = []): Iterable<[string[], T]> {
    for (const key in tree) {
        const node = tree[key];
        const path = [...root, key];

        if (node.value !== undefined) {
            yield [path, node.value];
        }

        yield* iterate(node.children, path);
    }
}

export function map<T, U>(tree: Trie<T>, selector: (path: string[], value: T) => U): Trie<U> {
    const nxetTree = {};

    for (const [path, value] of iterate(tree)) {
        mutableUpdate(nxetTree, path, selector(path, value));
    }

    return nxetTree;
}

function deleteObjectKey<T extends object>(source: T, key: keyof T): T {
    const dest = Object.assign({}, source);
    delete dest[key];
    return dest;
}
