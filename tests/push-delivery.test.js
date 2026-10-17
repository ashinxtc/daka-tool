import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hkdfSync,createDecipheriv} from 'node:crypto';
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
        assert.equal(options.headers['Content-Encoding'],'aes128gcm');
        assert.equal(options.headers.Encryption,undefined);
        const wire=Buffer.from(options.body),salt=wire.subarray(0,16);
        assert.equal(wire.readUInt32BE(16),4096);assert.equal(wire[20],65);
        const sender=wire.subarray(21,86);
        const publicKey=await crypto.subtle.importKey('raw',sender,{name:'ECDH',namedCurve:'P-256'},false,[]);
        const shared=await crypto.subtle.deriveBits({name:'ECDH',public:publicKey},receiver.privateKey,256);
        const ua=Buffer.from(subscription.keys.p256dh,'base64url');
        const ikm=hkdfSync('sha256',Buffer.from(shared),Buffer.from(subscription.keys.auth,'base64url'),
            Buffer.concat([Buffer.from('WebPush: info\0'),ua,sender]),32);
        const cek=Buffer.from(hkdfSync('sha256',Buffer.from(ikm),salt,Buffer.from('Content-Encoding: aes128gcm\0'),16));
        const nonce=Buffer.from(hkdfSync('sha256',Buffer.from(ikm),salt,Buffer.from('Content-Encoding: nonce\0'),12));
        const decipher=createDecipheriv('aes-128-gcm',cek,nonce);
        decipher.setAuthTag(wire.subarray(-16));
        const plain=Buffer.concat([decipher.update(wire.subarray(86,-16)),decipher.final()]);
        assert.equal(plain.at(-1),2);assert.equal(plain.subarray(0,-1).toString(),'test');
        return new Response(null,{status,headers:status===302?{Location:'https://other.example/'}:{}});
    };
    try{
        assert.equal((await sendWebPush(subscription,'test',keys)).ok,true);
        status=302;await assert.rejects(sendWebPush(subscription,'test',keys),/重定向/);
        assert.equal(calls,2);
        status=410;assert.equal((await sendWebPush(subscription,'test',keys)).expired,true);
    }finally{globalThis.fetch=original;}
});
