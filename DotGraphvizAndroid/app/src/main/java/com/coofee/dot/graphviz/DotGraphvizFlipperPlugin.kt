package com.coofee.dot.graphviz

import com.coofee.flipper.plugin.buffered.BufferedFlipperPlugin
import com.facebook.flipper.core.FlipperObject


private const val MainProcessAttachJson = """
    {
        "process": "com.coofee.dot.graphviz",
        "endTime": 8235927,
        "beginTime": 8235774,
        "skip": false,
        "children":
        [
            {
                "endTime": 8235855,
                "beginTime": 8235776,
                "skip": false,
                "children":
                [
                    {
                        "endTime": 8235877,
                        "beginTime": 8235855,
                        "skip": false,
                        "children":
                        [
                            {
                                "endTime": 8235927,
                                "beginTime": 8235877,
                                "skip": false,
                                "name": "FlipperWorker",
                                "cost": 50,
                                "thread": "Thread[main,5,main]",
                                "scheduler": "UI"
                            }
                        ],
                        "name": "AppEnvWorker",
                        "cost": 22,
                        "thread": "Thread[main,5,main]",
                        "scheduler": "UI"
                    }
                ],
                "name": "PrivacyWorker",
                "cost": 79,
                "thread": "Thread[main,5,main]",
                "scheduler": "UI"
            }
        ],
        "name": "MainProcessAttach",
        "cost": 153,
        "scheduler": ""
    }
"""

private const val MainProcessCreateJson = """
    {
        "process": "com.coofee.dot.graphviz",
        "endTime": 8236188,
        "beginTime": 8235935,
        "skip": false,
        "children":
        [
            {
                "endTime": 8236031,
                "beginTime": 8235938,
                "skip": false,
                "children":
                [
                    {
                        "endTime": 0,
                        "beginTime": 0,
                        "skip": false,
                        "name": "PreloadHomeDataWorker",
                        "cost": 0,
                        "scheduler": "UI_ENQUEUE"
                    }
                ],
                "name": "ExtractAssetsWorker",
                "cost": 93,
                "thread": "Thread[WM-IO-1,5,main]",
                "scheduler": "IO"
            },
            {
                "endTime": 8236003,
                "beginTime": 8235936,
                "skip": false,
                "children":
                [
                    {
                        "error":
                        {
                            "stacktrace": "java.lang.RuntimeException: error...",
                            "message": "error..."
                        },
                        "endTime": 8236010,
                        "beginTime": 8236009,
                        "skip": false,
                        "name": "ErrorWorker",
                        "cost": 1,
                        "thread": "Thread[WM-Compute-1,5,main]",
                        "scheduler": "COMPUTE"
                    },
                    {
                        "endTime": 8236014,
                        "beginTime": 8236003,
                        "skip": false,
                        "name": "SplashAdWorker",
                        "cost": 11,
                        "thread": "Thread[WM-Compute-2,5,main]",
                        "scheduler": "COMPUTE"
                    },
                    {
                        "skip": true,
                        "cost": -1,
                        "thread": "Thread[WM-Compute-3,5,main]",
                        "scheduler": "COMPUTE",
                        "name": "SkipWorker"
                    },
                    {
                        "endTime": 8236188,
                        "beginTime": 8236154,
                        "skip": false,
                        "name": "PreloadHomeDataWorker",
                        "cost": 34,
                        "thread": "Thread[main,5,main]",
                        "scheduler": "UI_ENQUEUE"
                    }
                ],
                "name": "InitSdkWorker",
                "cost": 67,
                "thread": "Thread[main,5,main]",
                "scheduler": "UI"
            }
        ],
        "name": "MainProcessCreate",
        "cost": 253,
        "scheduler": ""
    }
"""

private const val SubProcessAttach = """
    {
        "process": "com.coofee.dot.graphviz:subprocess",
        "endTime": 2246803890,
        "beginTime": 2246803813,
        "skip": false,
        "children":
        [
            {
                "endTime": 2246803864,
                "beginTime": 2246803815,
                "skip": false,
                "children":
                [
                    {
                        "endTime": 2246803884,
                        "beginTime": 2246803864,
                        "skip": false,
                        "children":
                        [
                            {
                                "endTime": 2246803890,
                                "beginTime": 2246803885,
                                "skip": false,
                                "name": "FlipperWorker",
                                "cost": 5,
                                "thread": "Thread[main,5,main]",
                                "scheduler": "UI"
                            }
                        ],
                        "name": "AppEnvWorker",
                        "cost": 20,
                        "thread": "Thread[main,5,main]",
                        "scheduler": "UI"
                    }
                ],
                "name": "PrivacyWorker",
                "cost": 49,
                "thread": "Thread[main,5,main]",
                "scheduler": "UI"
            }
        ],
        "name": "SubProcessAttach",
        "cost": 77,
        "scheduler": ""
    }
"""

private const val SubProcessCreate = """
    {
        "process": "com.coofee.dot.graphviz:subprocess",
        "endTime": 2246803987,
        "beginTime": 2246803893,
        "skip": false,
        "children":
        [
            {
                "endTime": 2246803987,
                "beginTime": 2246803893,
                "skip": false,
                "name": "SyncAccountWorker",
                "cost": 94,
                "thread": "Thread[WM-Compute-1,5,main]",
                "scheduler": "COMPUTE"
            },
            {
                "endTime": 2246803956,
                "beginTime": 2246803894,
                "skip": false,
                "name": "SyncCityWorker",
                "cost": 62,
                "thread": "Thread[WM-Compute-2,5,main]",
                "scheduler": "COMPUTE"
            }
        ],
        "name": "SubProcessCreate",
        "cost": 94,
        "scheduler": ""
    }
"""

class DotGraphvizFlipperPlugin(isMainProcess: Boolean) : BufferedFlipperPlugin() {

    init {
        if (isMainProcess) {
            send("workerGroupNode", FlipperObject(MainProcessAttachJson))
            send("workerGroupNode", FlipperObject(MainProcessCreateJson))
        } else {
            send("workerGroupNode", FlipperObject(SubProcessAttach))
            send("workerGroupNode", FlipperObject(SubProcessCreate))
        }
    }

    override fun getId(): String = "dotGraphvizDemo"

    override fun runInBackground(): Boolean = true
}