 using Common.Logging;
using Terrasoft.Core;
using Terrasoft.Core.Configuration;
using Terrasoft.Web.Common;


namespace Expertus.Creatio.Bootstrap
{
	public static class SentryInitializer 
	{
	    private static bool _initialized = false;
	    private static readonly object _lock = new object();
	
	    public static void EnsureInitialized(UserConnection userConnection, ILog log) 
		{
	        if (_initialized)
			{
	            return;
	        }
	
	        lock (_lock)
			{
	            if (_initialized)
				{
	                return;
	            }
	
	            string dsn = SysSettings.GetValue<string>(userConnection, "ExptSentryDsn", null);
				string environment = SysSettings.GetValue<string>(userConnection, "ExptSentryEnvironment", null);
	            if (string.IsNullOrWhiteSpace(dsn))
				{
					log.Warn("ExptSentryDsn system setting is not set. Sentry is not initialized.");
	                return;
	            }
				if (string.IsNullOrWhiteSpace(environment))
				{
					log.Warn("ExptSentryEnvironment system setting is not set. Sentry is not initialized.");
	                return;
	            }
	
	            Sentry.SentrySdk.Init(o => {
	                o.Dsn = dsn;
	                o.Debug = false;
					o.Environment = environment;
	            });
	
	            _initialized = true;
	        }
	    }
	}

	public class ExpertusAppEventListener : AppEventListenerBase
    {
        private static readonly ILog _log = LogManager.GetLogger("Expertus");

        public override void OnAppStart(AppEventContext context)
        {
            var appConnection = context.Application["AppConnection"] as AppConnection;
			if (appConnection?.SystemUserConnection == null) 
			{
			    _log.Warn("OnAppStart. AppConnection or SystemUserConnection is not available. Sentry is not initialized.");
			    return;
			}
			
			SentryInitializer.EnsureInitialized(appConnection.SystemUserConnection, _log);

            Sentry.SentrySdk.CaptureMessage("Hello Sentry ExpertusAppEventListener.OnAppStart");
        }
    }

} 