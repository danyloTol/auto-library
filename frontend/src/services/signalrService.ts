import * as signalR from '@microsoft/signalr';

export const createChatHubConnection = (token: string) => {
  const baseUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
    : '';

  const hubUrl = `${baseUrl}/chatHub`;

  return new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token,
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect()
    .build();
};
