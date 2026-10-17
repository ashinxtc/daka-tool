// Device credentials never use app_* keys and never belong in a family snapshot.
export const isSecretKey = key => /password|api_?key|secret|webhook|callback_token|callback_aes|pair_token|private_key/i.test(key)
    || key === 'app_report_config_v1';
export const stripSecrets = data => {
    const clean=Object.fromEntries(Object.entries(data).filter(([key]) => !isSecretKey(key)));
    if(clean._keyVersions)clean._keyVersions=Object.fromEntries(Object.entries(clean._keyVersions).filter(([key])=>!isSecretKey(key)&&key!=='app_authorized_parents_v1'));
    return clean;
};
export const canonical = value => JSON.stringify(value, (_, item) => item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key,item[key]])) : item);
export const sameStoredValue = (a,b) => {
    // Invalid legacy strings must not compare equal to valid JSON strings: the
    // application can interpret these differently (fallback vs. stored value).
    const parse = value => {try{return {valid:true,value:JSON.parse(value)};}catch{return {valid:false,value};}};
    return canonical(parse(a)) === canonical(parse(b));
};
