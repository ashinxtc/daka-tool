// Run only in a controlled administrator environment. Never put the secret in
// a CLI argument, repository file, browser page, or user-facing invitation.
import {mintActivation} from '../server/family-access.js';
const [code,purpose='activate']=process.argv.slice(2);
if(!/^[\w一-鿿-]{4,32}$/.test(code||'')||!['activate','recover'].includes(purpose)){
    console.error('Usage: node scripts/mint-family-activation.mjs FAMILY_CODE [activate|recover]');process.exitCode=1;
}else{
    try{console.log(await mintActivation(process.env.AUTH_BOOTSTRAP_SECRET,code,purpose));}
    catch{console.error('Configure AUTH_BOOTSTRAP_SECRET securely in this administrator environment (at least 32 characters).');process.exitCode=1;}
}
