package fr.fitduo.app;

import android.app.UiModeManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.content.res.Configuration;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Indique au code web si l'app tourne sur un téléviseur / décodeur Android TV,
 * pour activer la mise en page TV (taille adaptée à l'écran, effets allégés).
 */
@CapacitorPlugin(name = "TvInfo")
public class TvInfoPlugin extends Plugin {

    @PluginMethod
    public void getInfo(PluginCall call) {
        Context ctx = getContext();
        UiModeManager ui = (UiModeManager) ctx.getSystemService(Context.UI_MODE_SERVICE);
        boolean isTv = (ui != null && ui.getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION)
                || ctx.getPackageManager().hasSystemFeature(PackageManager.FEATURE_LEANBACK);

        JSObject ret = new JSObject();
        ret.put("isTv", isTv);
        ret.put("densityDpi", ctx.getResources().getDisplayMetrics().densityDpi);
        call.resolve(ret);
    }
}
