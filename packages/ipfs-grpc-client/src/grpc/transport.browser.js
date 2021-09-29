import grpcWeb from '@improbable-eng/grpc-web'

export const transport = () => grpcWeb.grpc.WebsocketTransport
