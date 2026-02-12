Update public."SysSettingsValue"
Set "TextValue" = 'Expt'
WHERE "SysSettingsId" in
(SELECT "Id" FROM public."SysSettings"
WHERE "Code" = 'SchemaNamePrefix')