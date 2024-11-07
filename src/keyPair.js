import crypto from 'crypto';

class KeyPair {
    constructor() {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
          namedCurve: 'secp256k1',
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
          },
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
          },
        });
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        // this.address = Blockchain.generateAddressFromKey(publicKey);
    }
}

export default KeyPair;