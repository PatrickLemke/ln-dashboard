const fs = require('fs');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

require('./config.js');

class LN {
    constructor() {
        process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';

        // Lnd admin macaroon is at ~/.lnd/admin.macaroon on Linux and
        // ~/Library/Application Support/Lnd/admin.macaroon on Mac
        const m = fs.readFileSync(MACAROON_PATH);
        const macaroon = m.toString('hex');

        // build meta data credentials
        const metadata = new grpc.Metadata();
        metadata.add('macaroon', macaroon);
        const macaroonCreds = grpc.credentials.createFromMetadataGenerator((_args, callback) => {
            callback(null, metadata);
        });

        // build ssl credentials using the cert the same as before
        const lndCert = fs.readFileSync(CERT_PATH);
        const sslCreds = grpc.credentials.createSsl(lndCert);

        // combine the cert credentials and the macaroon auth credentials
        // such that every call is properly encrypted and authenticated
        const credentials = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);

        const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
            defaults: true,
            enums: String,
            keepCase: true,
            longs: String,
            oneofs: true,
        });

        // Pass the credentials when creating a channel
        const lnrpcDescriptor = grpc.loadPackageDefinition(packageDefinition);
        const lnrpc = lnrpcDescriptor.lnrpc;

        return new lnrpc.Lightning(SOCKET, credentials);
    }
}

module.exports = LN;