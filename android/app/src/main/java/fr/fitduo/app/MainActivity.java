package fr.fitduo.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugin local : détection Android TV (doit être enregistré avant super.onCreate)
        registerPlugin(TvInfoPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
