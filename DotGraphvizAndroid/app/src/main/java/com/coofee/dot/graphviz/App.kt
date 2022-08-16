package com.coofee.dot.graphviz

import android.app.Application
import android.util.Log
import com.coofee.flipper.multiprocess.ActivityLifecycleFlipperPlugin
import com.coofee.flipper.multiprocess.FlipperMultiProcessPluginRegistry
import com.coofee.flipper.util.FlipperProcessUtil
import com.facebook.flipper.android.AndroidFlipperClient
import com.facebook.flipper.android.utils.FlipperUtils
import com.facebook.flipper.plugins.inspector.DescriptorMapping
import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin
import com.facebook.soloader.SoLoader

class App : Application() {

    override fun onCreate() {
        super.onCreate()
        installFlipper(this)
    }

    private fun installFlipper(application: Application) {

        if (FlipperProcessUtil.isMainProcess(application)) {

            if (FlipperUtils.shouldEnableFlipper(application)) {
                FlipperMultiProcessPluginRegistry.setLogLevel(Log.VERBOSE)
                SoLoader.init(application, false)
                FlipperMultiProcessPluginRegistry.addPlugin(
                    application, ActivityLifecycleFlipperPlugin(
                        application,
                        InspectorFlipperPlugin(
                            application,
                            DescriptorMapping.withDefaults()
                        )
                    )
                )
                FlipperMultiProcessPluginRegistry.addPlugin(
                    application,
                    DotGraphvizFlipperPlugin(true)
                )
                AndroidFlipperClient.getInstance(application).start()
            }
        } else {
            FlipperMultiProcessPluginRegistry.setLogLevel(Log.VERBOSE)
            FlipperMultiProcessPluginRegistry.addPlugin(
                application,
                DotGraphvizFlipperPlugin(false)
            )
        }
    }
}