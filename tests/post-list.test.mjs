import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true, ws: false, watch: null },
  appType: 'custom',
})

try {
  const { default: PostList } = await server.ssrLoadModule('/src/features/post/components/PostList.tsx')

  const renderPosts = (client) => renderToStaticMarkup(
    createElement(QueryClientProvider, { client }, createElement(PostList)),
  )

  await test('shows a loading message before posts arrive', () => {
    const client = new QueryClient()
    try {
      assert.match(renderPosts(client), /role="status"/)
    } finally {
      client.clear()
    }
  })

  await test('shows an empty state when there are no posts', () => {
    const client = new QueryClient()
    try {
      client.setQueryData(['posts'], [])
      assert.match(renderPosts(client), /No posts yet/)
    } finally {
      client.clear()
    }
  })

  await test('offers retry when the first request fails', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, retryOnMount: false } } })
    try {
      await assert.rejects(client.fetchQuery({
        queryKey: ['posts'],
        queryFn: () => Promise.reject(new Error('Network unavailable')),
      }))
      const html = renderPosts(client)
      assert.match(html, /role="alert"/)
      assert.match(html, /<button/)
    } finally {
      client.clear()
    }
  })

  await test('renders post content as text', () => {
    const client = new QueryClient()
    try {
      client.setQueryData(['posts'], [{ id: 1, title: '<script>alert(1)</script>', body: '<b>Text</b>' }])
      const html = renderPosts(client)
      assert.doesNotMatch(html, /<script>/)
      assert.match(html, /&lt;b&gt;Text&lt;\/b&gt;/)
    } finally {
      client.clear()
    }
  })

  const { getPosts } = await server.ssrLoadModule('/src/features/post/posts.api.ts')
  const { api } = await server.ssrLoadModule('/src/lib/api.ts')
  const originalAdapter = api.defaults.adapter

  await test('validates the posts response', async () => {
    try {
      for (const data of [null, {}, '<html></html>', [null], [{ id: 1, title: 'Missing body' }]]) {
        api.defaults.adapter = async (config) => ({ data, status: 200, statusText: 'OK', headers: {}, config })
        await assert.rejects(getPosts(), /invalid response/)
      }
      const posts = [{ id: 1, title: 'A post', body: 'Post content' }]
      api.defaults.adapter = async (config) => ({ data: posts, status: 200, statusText: 'OK', headers: {}, config })
      assert.deepEqual(await getPosts(), posts)
    } finally {
      api.defaults.adapter = originalAdapter
    }
  })

  await test('keeps loaded posts visible when a background refresh fails', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, retryOnMount: false } } })
    try {
      client.setQueryData(['posts'], [{ id: 1, title: 'Saved post', body: 'Still available' }])
      await assert.rejects(client.fetchQuery({
        queryKey: ['posts'],
        queryFn: () => Promise.reject(new Error('Network unavailable')),
      }))
      const html = renderToStaticMarkup(
        createElement(QueryClientProvider, { client }, createElement(PostList)),
      )
      assert.match(html, /Saved post/)
      assert.match(html, /Still available/)
    } finally {
      client.clear()
    }
  })
} finally {
  await server.close()
}
