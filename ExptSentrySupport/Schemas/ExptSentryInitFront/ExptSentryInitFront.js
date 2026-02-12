 define("ExptSentryInitFront", [], function () {
    if (window.__expertusSentryInitialized) {
        return {};
    }
    window.__expertusSentryInitialized = true;

    function loadSentry(callback) {
        if (window.Sentry) {
            callback();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://browser.sentry-cdn.com/7.101.1/bundle.tracing.replay.min.js";
        script.crossOrigin = "anonymous";
        script.onload = callback;
        document.head.appendChild(script);
    }

    function getSysSetting(code) {
        return new Promise((resolve) => {
            Terrasoft.SysSettings.querySysSettingsItem(code, function (value) {
                resolve(value);
            }, this);
        });
    }

    loadSentry(async function () {
        const dsn = await getSysSetting("ExptSentryFrontDsn");
        if (!dsn) {
            console.warn("Sentry frontend: DSN is empty, init skipped");
            return;
        }

        const environment =
            (await getSysSetting("ExptSentryEnvironment")) || "dev";

        const enableReplay =
            (await getSysSetting("ExptSentryFrontEnableReplay")) !== false;
        Sentry.init({
            dsn: dsn,

            integrations: (defaultIntegrations) => [
                ...defaultIntegrations,
                enableReplay
                    ? Sentry.replayIntegration({
                          maskAllText: true,
                          blockAllMedia: true
                      })
                    : null
            ].filter(Boolean),

            // PROD-friendly defaults
            tracesSampleRate: environment === "prod" ? 0.05 : 0.2,

            replaysSessionSampleRate:
                environment === "prod" ? 0.01 : 1.0,

            replaysOnErrorSampleRate:
                environment === "prod" ? 0.2 : 1.0,

            environment: environment,
            release:
                "creatio-freedom-" +
                (window?.Terrasoft?.coreVersion || "unknown")
        });

        setupCreatioErrorBridge();

        console.info("Sentry frontend initialized", {
            environment,
            replay: enableReplay
        });
    });

    function setupCreatioErrorBridge() {

        window.addEventListener("unhandledrejection", function (event) {
            try {
                Sentry.captureException(event.reason || event, {
                    mechanism: {
                        type: "unhandledrejection",
                        handled: false
                    }
                });
            } catch (e) {}
        });

        window.addEventListener("error", function (event) {
            if (!event.error) {
                return;
            }
            try {
                Sentry.captureException(event.error, {
                    mechanism: {
                        type: "window.onerror",
                        handled: false
                    }
                });
            } catch (e) {}
        });
    }

    return {};
});