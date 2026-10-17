import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sendWebPush} from '../push-worker.js';

test('delivery uses Workers-compatible manual redirects and never forwards credentials',async()=>{
    const vapid=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
    const receiver=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
    const b64=b=>Buffer.from(b).toString('base64url');
    const subscription={endpoint:'https://web.push.apple.com/test-endpoint',keys:{
        p256dh:b64(await crypto.subtle.exportKey('raw',receiver.publicKey)),auth:b64(crypto.getRandomValues(new Uint8Array(16)))}};
    const keys={publicKey:b64(await crypto.subtle.exportKey('raw',vapid.publicKey)),
        privateKeyHex:Buffer.from(await crypto.subtle.exportKey('pkcs8',vapid.privateKey)).toString('hex')};
    const original=globalThis.fetch;let status=201,calls=0;
    globalThis.fetch=async(url,options)=>{
        calls++;assert.equal(url,subscription.endpoint);assert.equal(options.redirect,'manual');
        assert.ok(options.headers.Authorization.startsWith('vapid '));
        assert.ok(options.body.byteLength>0);
        return new Response(null,{status,headers:status===302?{Location:'https://other.example/'}:{}});
    };
    try{
        assert.equal((await sendWebPush(subscription,'test',keys)).ok,true);
        status=302;await assert.rejects(sendWebPush(subscription,'test',keys),/重定向/);
        assert.equal(calls,2);
        status=410;assert.equal((await sendWebPush(subscription,'test',keys)).expired,true);
    }finally{globalThis.fetch=original;}
});
