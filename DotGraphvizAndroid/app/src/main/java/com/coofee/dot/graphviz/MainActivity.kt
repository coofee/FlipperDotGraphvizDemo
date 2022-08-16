package com.coofee.dot.graphviz

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<View>(R.id.start_sub_process).setOnClickListener {
            startActivity(Intent(this@MainActivity, SubProcessActivity::class.java))
        }
    }
}