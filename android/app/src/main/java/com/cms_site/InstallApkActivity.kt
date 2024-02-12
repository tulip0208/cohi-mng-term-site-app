package com.cms_site

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import java.io.File

class InstallApkActivity : AppCompatActivity() {

    companion object {
        private const val REQUEST_INSTALL_PERMISSION = 1
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        checkAndRequestInstallPermission()
    }

    private fun checkAndRequestInstallPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!packageManager.canRequestPackageInstalls()) {
                // 提供元不明のアプリのインストール許可を求める
                val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).setData(Uri.parse("package:$packageName"))
                startActivityForResult(intent, REQUEST_INSTALL_PERMISSION)
            } else {
                // 許可が既にある場合は、APKファイルパスを取得してインストールを続行
                proceedWithInstallation()
            }
        } else {
            // Android Oより前のバージョンでは直接インストールを続行
            proceedWithInstallation()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_INSTALL_PERMISSION) {
            if (resultCode == RESULT_OK) {
                // 許可を得た後、インストールを続行
                proceedWithInstallation()
            } else {
                // ユーザーが許可しなかった場合の処理
                Toast.makeText(this, "インストール許可が必要です", Toast.LENGTH_SHORT).show()
                finish()
            }
        }
    }

    private fun proceedWithInstallation() {
        // IntentからAPKファイルのパスを取得してインストールを試みる
        val apkFilePath = intent.getStringExtra("APK_FILE_PATH") ?: return
        installApk(apkFilePath)
    }
    
    private fun installApk(apkFilePath: String) {
        val apkFile = File(apkFilePath)
        val apkUri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            FileProvider.getUriForFile(this, "${applicationContext.packageName}.provider", apkFile)
        } else {
            Uri.fromFile(apkFile)
        }
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(apkUri, "application/vnd.android.package-archive")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivity(intent)
    }

}
