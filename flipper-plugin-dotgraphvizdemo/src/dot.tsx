
export const EMPTY: string = 'digraph Stages {}'

let subgraphId = 0

export const styles = {
    UI: {
        color: '#ffc0cb',
        colorName: 'pink'
    },
    UI_ENQUEUE: {
        color: '#ff82ab',
        colorName: 'palevioletred1'
    },
    IO: {
        color: '#b4eeb4',
        colorName: 'darkseagreen2'
    },
    COMPUTE: {
        color: '#8fbc8f',
        colorName: 'darkseagreen'
    },
    ERROR: {
        color: '#ff0000',
        colorName: 'red'
    },
    SKIP: {
        border: '1px dashed'
    }
}

export type ErrorMessage = {
    message: string;
    stacktrace: string;
}

export type Node = {
    process?: string;
    name: string;
    skip: boolean;
    scheduler: string
    thread: string;
    beginTime: bigint;
    endTime: bigint;
    error: ErrorMessage;
    children: Array<Node>;
}

export function digraph(process: string, workerGroupNodes: Array<Node>): string {
    let digraph = `digraph Stages {
        label="${process}";
        labelloc=tc;
        rankdir=LR;
        bgcolor=transparent;
        node [fontsize=11];
    `

    let newNodes = [...workerGroupNodes]
    // let beginSubgraphId = subgraphId;
    // let endSubgraphId = subgraphId + newNodes.length
    let reverseNodes = newNodes.reverse();
    reverseNodes.map(workerGroupNode => {
        digraph += subgraph(workerGroupNode)
    })

    // let alignSubgraph = ''
    // for (let index = beginSubgraphId; index < endSubgraphId - 1; index++) {
    //     alignSubgraph += `start${index} -> start${index + 1}[lhead=cluster_${reverseNodes[index - beginSubgraphId].name}, constraint=false];`
    // }

    // console.log(`alignSubgraph=${alignSubgraph}`)
    // digraph += alignSubgraph;

    digraph += '}'
    return digraph
}

function subgraph(workerGroupNode: Node): string {
    // let startNodeId = subgraphId++;
    // let startNode = `start${startNodeId}[label=${startNodeId}];`
    // let subgraph = `subgraph cluster_${workerGroupNode.name} {
    //                     label="${workerGroupNode.name}";
    //                     labelloc=tc;
    //                     ${startNode}
    //     `

    let cost = workerGroupNode.endTime - workerGroupNode.beginTime;
    let subgraph = `subgraph cluster_${workerGroupNode.name} {
        label="${workerGroupNode.name}\n${cost}ms";
        labelloc=tc;
    `
    let edgeMap = new Map<String, Set<String>>();

    workerGroupNode.children?.map(child => {
        subgraph += traverse(child, edgeMap)
    })

    subgraph += "}";
    return subgraph
}

function traverse(node: Node, edgeMap: Map<String, Set<String>>): string {
    let dot = '';
    let childSet = edgeMap.get(node.name) || new Set<String>();

    if (!edgeMap.has(node.name)) {
        dot = defineNode(node);
        edgeMap.set(node.name, childSet);
    }

    node.children?.map(child => {
        dot += traverse(child, edgeMap)
        if (!childSet.has(child.name)) {
            childSet.add(child.name);
            dot += defineEdge(node, child);
        }
    })

    return dot
}

function defineEdge(parent: Node, child: Node): string {
    if (child.skip) {
        return `${parent.name} -> ${child.name} [style=dashed];`
    } else {
        return `${parent.name} -> ${child.name};`
    }
}

function defineNode(node: Node): string {
    let defineDot;
    let cost = node.endTime - node.beginTime
    if (node.skip) {
        defineDot = `${node.name} [label="${node.name}\n被跳过，未执行"`
    } else if (cost > 0) {
        defineDot = `${node.name} [label=<${node.name}<BR/>${cost}ms>`
    } else {
        defineDot = `${node.name} [label="${node.name}"`
    }

    switch (node.scheduler) {
        case 'UI':
            defineDot += `, style=filled, color=${styles.UI.colorName}`;
            break;
        case 'UI_ENQUEUE':
            defineDot += `, style=filled, color=${styles.UI_ENQUEUE.colorName}`;
            break;
        case 'IO':
            defineDot += `, style=filled, color=${styles.IO.colorName}`;
            break;
        case 'COMPUTE':
            defineDot += `, style=filled, color=${styles.COMPUTE.colorName}`;
            break;
    }

    if (node.skip) {
        defineDot += `, style=dashed`
    }

    if (node.error) {
        defineDot += `, color=${styles.ERROR.colorName}`
    }

    return defineDot + '];';
}