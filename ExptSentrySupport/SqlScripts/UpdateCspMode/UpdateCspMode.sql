Update public."SysSettingsValue"
Set "GuidValue" = 'b78d2735-85c2-4d0f-9e35-765b5b115581' --Disable content security
WHERE "SysSettingsId" in
(SELECT "Id" FROM public."SysSettings"
WHERE "Code" = 'CspMode')