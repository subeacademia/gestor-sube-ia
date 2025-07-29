import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'firmar-contrato/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([
      { id: '1' },
      { id: '2' },
      { id: '3' }
    ])
  },
  {
    path: 'preview-contrato/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([
      { id: '1' },
      { id: '2' },
      { id: '3' }
    ])
  },
  {
    path: 'firmar-cliente/:idContrato/:token',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([
      { idContrato: '1', token: 'token1' },
      { idContrato: '2', token: 'token2' },
      { idContrato: '3', token: 'token3' }
    ])
  },
  {
    path: 'firmar-cliente/:idContrato',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([
      { idContrato: '1' },
      { idContrato: '2' },
      { idContrato: '3' }
    ])
  },
  {
    path: 'enviar-firma/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([
      { id: '1' },
      { id: '2' },
      { id: '3' }
    ])
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
