import React, { useCallback } from 'react';

import {
  PluginClient,
  usePlugin,
  createState,
  useValue,
  Layout,
  DataTable,
  DataTableColumn,
  DetailSidebar,
  createDataSource,
  Toolbar
} from 'flipper-plugin';

import {
  Select,
  Tag,
  Radio,
  RadioChangeEvent,
  Typography
} from 'antd'
const { Option } = Select;

import {
  DotChartOutlined,
  TableOutlined,
} from '@ant-design/icons';

import ReactJson from 'react-json-view'

import { Graphviz, injectGraphvizDependencies } from './graphviz'

import { EMPTY, Node, ErrorMessage, digraph, styles } from './dot'


type Events = {
  workerGroupNode: Node;
};

type Row = {
  name: string;
  thread: string;
  status: string;
  cost: bigint;
  details: Node;
}

const baseColumns: DataTableColumn<Row>[] = [
  {
    key: 'name',
    width: '40%',
    title: '任务名',
    align: 'left'
  },
  {
    key: 'thread',
    width: '40%',
    title: '线程名',
    align: 'left'
  }, {
    key: 'status',
    width: '10%',
    title: '执行状态',
    align: 'center'
  },
  {
    key: 'cost',
    width: '10%',
    title: '耗时',
    align: 'center',
    formatters: (value) => `${value}`
  }
];

function mapNode(node: Node, collector: Map<string, Row>): Map<string, Row> {
  let status = '成功'
  let cost = BigInt(-1)
  if (!node.skip) {
    cost = node.endTime - node.beginTime
  }

  if (node.error) {
    status = `失败: ${node.error.message}`
  } else if (node.skip) {
    status = '跳过'
  }

  collector.set(node.name, {
    name: node.name,
    thread: node.thread,
    status: status,
    cost: cost,
    details: node
  })

  node.children?.map(child => mapNode(child, collector))
  return collector
}

function mapNodes(nodes: Node[]): Array<Row> {
  let collector = new Map<string, Row>()
  nodes?.map(node => {
    mapNode(node, collector)
    // collector.delete(node.name)
  })
  return Array.from(collector.values())
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#creating-a-first-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#pluginclient
export function plugin(client: PluginClient<Events, {}>) {
  const processAndWorkerNodes = createState<Record<string, Array<Node>>>({}, { persist: 'processAndWorkerNodes' });
  const selectedProcess = createState<string>('', { persist: 'selectedProcess' })
  const selectedProcessGraph = createState<string>(EMPTY, { persist: 'selectedProcessGraph' })

  const tableColumns = createState<DataTableColumn<Row>[]>(baseColumns, { persist: 'workmanagercolumns' })
  const tableSelectedDetails = createState<Node>()
  const tableOnSelect = (item: Row) => {
    if (item && item.details) {
      tableSelectedDetails.set(item.details)
    }
  }
  const tableRows = createDataSource<Row>([], { persist: 'workmanagerrows' })

  const onSelectedProcess = (process: string) => {
    selectedProcess.set(process)
    let workerNodes = processAndWorkerNodes.get()[process]

    let dot = digraph(process, workerNodes);
    console.log(`current select process=${process} workerNodes=${JSON.stringify(workerNodes)}, dot below`)
    // console.log(`${dot}`)
    selectedProcessGraph.set(dot)

    tableRows.clear();
    let rows = mapNodes(workerNodes)
    console.log(`rows=${rows.length}`)
    rows.map(item => tableRows.append(item))
  }

  client.onMessage("workerGroupNode", (node) => {
    let processName = node.process
    if (processName == undefined) {
      console.log(`cannot find process in node=${node}`)
      return
    }

    processAndWorkerNodes.update(draft => {
      let workerGroupArray = draft[processName!!] || []
      workerGroupArray.push(node)
      draft[processName!!] = workerGroupArray
    })

    let currentSelectProcess = selectedProcess.get()
    if (currentSelectProcess == '' || currentSelectProcess == processName) {
      selectedProcess.update(draft => processName)
      onSelectedProcess(processName)
    }
  })

  client.addMenuEntry({
    action: 'clear',
    handler: async () => {
      processAndWorkerNodes.set({});
    },
    accelerator: 'ctrl+l',
  });

  const currentTab = createState<string>('graph', { persist: 'workdmanagerselecttab' })
  const onTabChanged = (tab: string) => {
    currentTab.set(tab)
  }

  return {
    currentTab,
    onTabChanged,

    processAndWorkerNodes,
    selectedProcess,
    onSelectedProcess,
    selectedProcessGraph,

    tableColumns,
    tableRows,
    tableOnSelect,
    tableSelectedDetails
  };
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#building-a-user-interface-for-the-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#react-hooks
export function Component() {
  injectGraphvizDependencies()

  const instance = usePlugin(plugin);

  const currentTab = useValue(instance.currentTab)
  const onRadioGroupChanged = useCallback(
    (event: RadioChangeEvent) => {
      instance.onTabChanged(event.target.value ?? 'graph')
    },
    [instance],
  );
  const onRadioGraphClick = useCallback(
    () => instance.onTabChanged('graph'),
    [instance]
  )
  const onRadioListClick = useCallback(
    () => instance.onTabChanged('list'),
    [instance]
  )

  const processAndWorkerNodes = useValue(instance.processAndWorkerNodes);
  const selectedProcess = useValue(instance.selectedProcess)
  let selectedProcessGraph = useValue(instance.selectedProcessGraph)
  if (selectedProcessGraph == undefined) {
    console.log(`selectedProcess=${selectedProcess} selectedProcessGraph is undefined`)
  }
  const onSelectedProcess = instance.onSelectedProcess

  const tableColumns = useValue(instance.tableColumns)
  const tableOnSelect = instance.tableOnSelect
  const tableSelectedDetails = useValue(instance.tableSelectedDetails)
  const tableRows = instance.tableRows

  return (
    <Layout.Container grow>
      <Select
        style={{ marginLeft: 8, marginTop: 8, marginRight: 8 }}
        onSelect={onSelectedProcess}
        placeholder={"请选择进程"}
        value={selectedProcess}
      >
        {
          Object.keys(processAndWorkerNodes).map(process => <Option key={process} value={process}>{process}</Option>)
        }
      </Select>

      <Toolbar position='top'>
        <Radio.Group value={currentTab} onChange={onRadioGroupChanged}>
          <Radio.Button value="graph" onClick={onRadioGraphClick}>
            <DotChartOutlined style={{ marginRight: 5 }} />
            <Typography.Text>依赖图</Typography.Text>
          </Radio.Button>
          <Radio.Button value="list" onClick={onRadioListClick}>
            <TableOutlined style={{ marginRight: 5 }} />
            <Typography.Text>列表</Typography.Text>
          </Radio.Button>
        </Radio.Group>
      </Toolbar>

      {
        'graph' == currentTab ? <Layout.Container grow style={{ margin: 8 }}>
          <div style={{ marginLeft: 8, marginBottom: 5 }}>
            <Tag color={styles.UI.color}>UI</Tag>
            <Tag color={styles.UI_ENQUEUE.color}>UI_ENQUEUE</Tag>
            <Tag color={styles.IO.color}>IO</Tag>
            <Tag color={styles.COMPUTE.color}>COMPUTE</Tag>
            <Tag color={styles.ERROR.color}>执行出错</Tag>
            <Tag style={ styles.SKIP }>跳过的任务</Tag>
          </div>
          <Graphviz 
            dot={selectedProcessGraph} 
            options={{ 
              fit: true, 
              width: '100%',
              height: '100%', 
              zoom: true,
              zoomScaleExtent: [0.5, 10]
            }} 
          />
        </Layout.Container> : null
      }

      {
        'list' == currentTab ? <Layout.Container grow style={{ margin: 8 }}>
          <DataTable
            columns={tableColumns}
            dataSource={tableRows}
            onSelect={tableOnSelect}
            enableAutoScroll
            enableMultiPanels
            enableHorizontalScroll={false}
          />

          <DetailSidebar>
            {tableSelectedDetails && Sidebar(tableSelectedDetails)}
          </DetailSidebar>
        </Layout.Container> : null
      }
    </Layout.Container>
  );
}

function Sidebar(tableSelectedDetails: Node) {
  return (
    <Layout.Container gap pad>
      <Typography.Title level={4}>详情</Typography.Title>
      {tableSelectedDetails && <ReactJson src={tableSelectedDetails} />}
    </Layout.Container>
  );
}
